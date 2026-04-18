const { Order } = require('../../models');
const {
    recalculateOrderTotal,
    applyDeliveredStock,
    restoreDeliveredStock,
    withOrderTransaction,
} = require('../utils/orderCalculations');

module.exports = {
    resource: Order,
    options: {
        id: 'Order',
        titleProperty: 'orderNumber',
        navigation: { name: 'Orders', icon: 'ShoppingCart' },
        properties: {
            UserId: { reference: 'User' },
            totalAmount: {
                isVisible: { list: true, show: true, edit: false, new: false },
            },
            taxAmount: {
                isVisible: { list: false, show: true, edit: true, new: true },
            },
            discountAmount: {
                isVisible: { list: false, show: true, edit: true, new: true },
            },
            shippingAddress: { type: 'textarea' },
            notes: { type: 'textarea' },
        },
        actions: {
            new: {
                before: async (request, context) => {
                    if (context?.currentAdmin?.role !== 'admin') {
                        request.payload = request.payload || {};
                        request.payload.UserId = context.currentAdmin.id;
                    }
                    return request;
                },
                after: async (response) => {
                    const orderId = Number(response?.record?.params?.id);
                    if (!orderId) return response;

                    let totalAmount = Number(response?.record?.params?.totalAmount || 0);
                    await withOrderTransaction(async (transaction) => {
                        totalAmount = await recalculateOrderTotal(orderId, transaction);
                    });

                    if (response?.record?.params) {
                        response.record.params.totalAmount = String(totalAmount ?? 0);
                    }

                    return response;
                },
            },
            edit: {
                before: async (request, context) => {
                    context.previousStatus = context?.record?.params?.status;

                    if (context?.currentAdmin?.role !== 'admin') {
                        request.payload = request.payload || {};
                        request.payload.UserId = context.currentAdmin.id;
                    }
                    return request;
                },
                after: async (response, request, context) => {
                    const orderId = Number(response?.record?.params?.id);
                    if (!orderId) return response;

                    const nextStatus = response?.record?.params?.status;
                    const previousStatus = context?.previousStatus;

                    let totalAmount = Number(response?.record?.params?.totalAmount || 0);
                    await withOrderTransaction(async (transaction) => {
                        if (previousStatus !== 'delivered' && nextStatus === 'delivered') {
                            await applyDeliveredStock(orderId, transaction);
                        }

                        if (previousStatus === 'delivered' && nextStatus !== 'delivered') {
                            await restoreDeliveredStock(orderId, transaction);
                        }

                        totalAmount = await recalculateOrderTotal(orderId, transaction);
                    });

                    if (response?.record?.params) {
                        response.record.params.totalAmount = String(totalAmount ?? 0);
                    }

                    return response;
                },
            },
        },
    },
};