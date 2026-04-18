const { Op } = require('sequelize');
const { sequelize, Order, OrderItem, Product } = require('../../models');

const toNumber = (value) => Number(value || 0);

async function recalculateOrderTotal(orderId, transaction) {
  const order = await Order.findByPk(orderId, { transaction });
  if (!order) return null;

  const items = await OrderItem.findAll({
    where: { OrderId: orderId },
    attributes: ['totalPrice'],
    transaction,
  });

  const itemsSubtotal = items.reduce((sum, item) => sum + toNumber(item.totalPrice), 0);
  const totalAmount = Math.max(itemsSubtotal + toNumber(order.taxAmount) - toNumber(order.discountAmount), 0);

  await order.update({ totalAmount: totalAmount.toFixed(2) }, { transaction });
  return totalAmount;
}

async function applyDeliveredStock(orderId, transaction) {
  const items = await OrderItem.findAll({
    where: { OrderId: orderId },
    attributes: ['ProductId', 'quantity'],
    transaction,
  });

  if (!items.length) return;

  const qtyByProduct = items.reduce((acc, item) => {
    acc[item.ProductId] = (acc[item.ProductId] || 0) + toNumber(item.quantity);
    return acc;
  }, {});

  const productIds = Object.keys(qtyByProduct).map((id) => Number(id));
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    transaction,
  });

  for (const product of products) {
    const requiredQty = qtyByProduct[product.id] || 0;
    if (toNumber(product.stock) < requiredQty) {
      throw new Error(`Insufficient stock for product \"${product.name}\".`);
    }
  }

  for (const product of products) {
    const requiredQty = qtyByProduct[product.id] || 0;
    await product.update({ stock: toNumber(product.stock) - requiredQty }, { transaction });
  }
}

async function restoreDeliveredStock(orderId, transaction) {
  const items = await OrderItem.findAll({
    where: { OrderId: orderId },
    attributes: ['ProductId', 'quantity'],
    transaction,
  });

  if (!items.length) return;

  const qtyByProduct = items.reduce((acc, item) => {
    acc[item.ProductId] = (acc[item.ProductId] || 0) + toNumber(item.quantity);
    return acc;
  }, {});

  const productIds = Object.keys(qtyByProduct).map((id) => Number(id));
  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds } },
    transaction,
  });

  for (const product of products) {
    const restoreQty = qtyByProduct[product.id] || 0;
    await product.update({ stock: toNumber(product.stock) + restoreQty }, { transaction });
  }
}

async function withOrderTransaction(work) {
  return sequelize.transaction(async (transaction) => work(transaction));
}

module.exports = {
  recalculateOrderTotal,
  applyDeliveredStock,
  restoreDeliveredStock,
  withOrderTransaction,
};
