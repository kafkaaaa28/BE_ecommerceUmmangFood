import type { Prisma } from "../../../generated/prisma/client.js";

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';
type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        variant: {
          select: {
            id: true;
            variantName: true;
            product: { select: { id: true; name: true } };
          };
        };
      };
    };
    payment: true;
  };
}>;
export function buildSnapPayload(
  order: OrderWithItems,
  expiryMinutes: number = 60,
) {
  const expiryDate = _formatMidtransDate(
    new Date(Date.now() + expiryMinutes * 60 * 1000),
  );

  return {
    transaction_details: {
      order_id: order.code,
      gross_amount: Number(order.total),
    },

    item_details: _buildItemDetails(order),

    customer_details: {
      first_name: order.namaPenerima,
      phone: order.phone,
      shipping_address: {
        first_name: order.namaPenerima,
        phone: order.phone,
        address: order.jalan,
        city: order.kota ?? "",
        postal_code: order.kodePos ?? "",
      },
    },

    expiry: {
      start_time: _formatMidtransDate(new Date()),
      unit: "minutes",
      duration: expiryMinutes,
    },

    callbacks: {
      finish: `${FRONTEND_URL}/orders/${order.id}/payment/finish`,
      cancel: `${FRONTEND_URL}/orders/${order.id}/payment/cancel`,
      error: `${FRONTEND_URL}/orders/${order.id}/payment/error`,
    },
  };
}

function _buildItemDetails(order: OrderWithItems) {
  const items = order.items.map((item) => ({
    id: item.id,
    name: item.variant?.product?.name?.slice(0, 50) ?? "Produk",
    price: Number(item.unitPrice),
    quantity: item.qty,
  }));

  if (Number(order.shippingFee) > 0) {
    items.push({
      id: "SHIPPING",
      name: `Ongkir (${order.shipCourierCode ?? ""} ${order.shipServiceCode ?? ""})`.trim(),
      price: Number(order.shippingFee),
      quantity: 1,
    });
  }

  return items;
}

function _formatMidtransDate(date: Date | number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = new Date(date);

  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);

  return [
    `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}`,
    " ",
    `${pad(wib.getUTCHours())}:${pad(wib.getUTCMinutes())}:${pad(wib.getUTCSeconds())}`,
    " +0700",
  ].join("");
}
