const AdminJSImport = require('adminjs');
const ValidationError = AdminJSImport.ValidationError || AdminJSImport.default?.ValidationError;
const { OrderItem, Order, Product } = require('../../models');
const { recalculateOrderTotal, withOrderTransaction } = require('../utils/orderCalculations');

const ensureOrderIsEditable = async (orderId) => {
  if (!orderId) return;
  const order = await Order.findByPk(orderId, { attributes: ['id', 'status'] });
  if (!order) return;

  if (order.status === 'delivered') {
    throw new ValidationError({
      OrderId: { message: 'Delivered orders are locked. Change order status first.' },
    });
  }
};

const applyPricingFromProduct = async (payload) => {
  const productId = Number(payload?.ProductId || 0);
  const quantity = Number(payload?.quantity || 0);

  if (!productId || quantity <= 0) return;

  const product = await Product.findByPk(productId, { attributes: ['id', 'price', 'name'] });
  if (!product) {
    throw new ValidationError({
      ProductId: { message: 'Selected product was not found.' },
    });
  }

  const unitPrice = Number(product.price || 0);
  payload.unitPrice = unitPrice.toFixed(2);
  payload.totalPrice = (quantity * unitPrice).toFixed(2);
};

const cloneRequest = (request) => ({
  ...request,
  payload: request?.payload ? { ...request.payload } : request?.payload,
});

const withSuccessNotice = (response) => ({
  ...response,
  notice: {
    message: 'Order total recalculated from order items.',
    type: 'success',
  },
});

module.exports = {
  resource: OrderItem,
  options: {
    id: 'OrderItem',
    titleProperty: 'id',
    navigation: { name: 'Orders', icon: 'Order' },
    properties: {
      OrderId: { reference: 'Order' },
      ProductId: { reference: 'Product' },
      totalPrice: { isDisabled: true },
    },
    actions: {
      new: {
        before: async (request) => {
          const nextRequest = cloneRequest(request);
          await ensureOrderIsEditable(nextRequest.payload?.OrderId);

          await applyPricingFromProduct(nextRequest.payload || {});
          return nextRequest;
        },
        after: async (response) => {
          const orderId = Number(response?.record?.params?.OrderId);
          if (!orderId) return response;

          await withOrderTransaction(async (transaction) => {
            await recalculateOrderTotal(orderId, transaction);
          });

          return withSuccessNotice(response);
        },
      },
      edit: {
        before: async (request, context) => {
          const nextRequest = cloneRequest(request);
          const orderId = nextRequest.payload?.OrderId || context?.record?.params?.OrderId;
          await ensureOrderIsEditable(orderId);

          await applyPricingFromProduct(nextRequest.payload || {});
          return nextRequest;
        },
        after: async (response) => {
          const orderId = Number(response?.record?.params?.OrderId);
          if (!orderId) return response;

          await withOrderTransaction(async (transaction) => {
            await recalculateOrderTotal(orderId, transaction);
          });

          return withSuccessNotice(response);
        },
      },
      delete: {
        before: async (request, context) => {
          context.orderId = Number(context?.record?.params?.OrderId);
          await ensureOrderIsEditable(context.orderId);
          return request;
        },
        after: async (response, request, context) => {
          if (!context?.orderId) return response;

          await withOrderTransaction(async (transaction) => {
            await recalculateOrderTotal(context.orderId, transaction);
          });

          return withSuccessNotice(response);
        },
      },
    },
  },
};
