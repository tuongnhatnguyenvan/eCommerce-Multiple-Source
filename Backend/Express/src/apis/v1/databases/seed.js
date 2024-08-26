import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const main = async () => {
  // Clear existing data
  await prisma.order_item.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product_inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.product_category.deleteMany({});
  await prisma.user_address.deleteMany({});
  await prisma.payment_method.deleteMany({});
  await prisma.cart_item.deleteMany({});
  await prisma.shopping_session.deleteMany({});
  await prisma.user_role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.discount.deleteMany({});

  console.log("All data cleared successfully!");

  // Define the number of records to create
  const amountOfUsers = 10;
  const amountOfDiscounts = 5;
  const amountOfProducts = 10;
  const amountOfCategories = 5;

  // Create roles
  const roles = [
    { id: "1", role: "ADMIN", created_at: new Date(), updated_at: new Date() },
    { id: "2", role: "USER", created_at: new Date(), updated_at: new Date() },
    { id: "3", role: "GUEST", created_at: new Date(), updated_at: new Date() },
  ];

  await prisma.role.createMany({ data: roles });

  // Create users
  const users = Array.from({ length: amountOfUsers }).map(() => ({
    id: faker.string.uuid(),
    username: faker.internet.userName(),
    password_hash: faker.internet.password(),
    full_name: faker.person.fullName(),
    phone_number: faker.phone.number(),
    created_by: "1",
    updated_by: "1",
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await prisma.user.createMany({ data: users });

  // Create user roles
  const userRoles = users.map((user, index) => ({
    user_id: user.id,
    role_id: index % 3 === 0 ? "1" : index % 2 === 0 ? "2" : "3",
    created_at: faker.date.past(),
    updated_at: new Date(),
  }));

  await prisma.user_role.createMany({ data: userRoles });

  // Create user addresses
  const userAddresses = users.map((user) => ({
    id: faker.string.uuid(),
    address_line1: faker.location.streetAddress(),
    address_line2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    country: faker.location.country(),
    postal_code: faker.location.zipCode(),
    user_id: user.id,
  }));

  await prisma.user_address.createMany({ data: userAddresses });

  // Create payment methods
  const paymentMethods = users.map((user) => ({
    id: faker.string.uuid(),
    payment_type: faker.finance.transactionType(),
    provider: faker.company.name(),
    city: faker.location.city(),
    is_default: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(["ACTIVE", "INACTIVE", "PENDING"]),
    user_id: user.id,
  }));

  await prisma.payment_method.createMany({ data: paymentMethods });

  // Create categories
  const categories = Array.from({ length: amountOfCategories }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.department() + faker.string.uuid(),
    desc: faker.lorem.sentence(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    delete_at: faker.datatype.boolean() ? faker.date.past() : null,
    parent_id: null,
  }));

  await prisma.product_category.createMany({ data: categories });

  // Create subcategories for each category
  const categoryIds = categories.map((category) => category.id);
  const subCategories = categories.flatMap((category) =>
    Array.from({ length: 3 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.commerce.department() + faker.string.uuid(),
      desc: faker.lorem.sentence(),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
      delete_at: faker.datatype.boolean() ? faker.date.past() : null,
      parent_id: category.id,
    }))
  );

  await prisma.product_category.createMany({ data: subCategories });

  // Create discounts
  const discounts = Array.from({ length: amountOfDiscounts }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName() + faker.string.uuid(),
    desc: faker.lorem.sentence(),
    discount_percent: faker.number.int({ min: 5, max: 50 }),
    active: faker.datatype.boolean(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await prisma.discount.createMany({ data: discounts });

  // Create products
  const products = Array.from({ length: amountOfProducts }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    desc: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    discount_id: faker.helpers.arrayElement(discounts).id,
    category_id: faker.helpers.arrayElement(categoryIds),
  }));

  await prisma.product.createMany({ data: products });

  // Create product inventories
  const productInventories = products.map((product) => ({
    id: faker.string.uuid(),
    quantity: faker.number.int({ min: 0, max: 100 }),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    product_id: product.id,
  }));

  await prisma.product_inventory.createMany({ data: productInventories });

  // Create orders
  const orders = users.map((user) => ({
    id: faker.string.uuid(),
    total: parseFloat(faker.commerce.price()),
    order_status: faker.helpers.arrayElement([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ]),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    user_id: user.id,
  }));

  await prisma.order.createMany({ data: orders });

  // Create payments
  const payments = orders.map((order) => ({
    id: faker.string.uuid(),
    amount: order.total,
    payment_status: faker.datatype.boolean(),
    payment_date: faker.date.past(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    order_id: order.id,
  }));

  await prisma.payment.createMany({ data: payments });

  // Create order items
  const orderItemsSet = new Set();
  const orderItems = orders.flatMap((order) => {
    const uniqueProductIds = Array.from(
      new Set(
        Array.from({ length: 3 }).map(
          () => faker.helpers.arrayElement(products).id
        )
      )
    );

    return uniqueProductIds
      .filter((productId) => !orderItemsSet.has(productId))
      .map((productId) => {
        orderItemsSet.add(productId);
        return {
          id: faker.string.uuid(),
          quantity: parseFloat(faker.string.numeric(2)),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
          order_id: order.id,
          product_id: productId,
        };
      });
  });

  await prisma.order_item.createMany({ data: orderItems });

  // Create shopping sessions
  const shoppingSessions = users.map((user) => ({
    id: faker.string.uuid(),
    total: parseFloat(faker.commerce.price()),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
    user_id: user.id,
  }));

  await prisma.shopping_session.createMany({ data: shoppingSessions });

  // Create cart items
  const uniqueProductIds = new Set();
  const cartItems = shoppingSessions.flatMap((cart) => {
    return Array.from({ length: 3 })
      .map(() => {
        const productId = faker.helpers.arrayElement(products).id;

        if (uniqueProductIds.has(productId)) return null;

        uniqueProductIds.add(productId);

        return {
          id: faker.string.uuid(),
          quantity: parseFloat(faker.string.numeric(2)),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
          shopping_session_id: cart.id,
          product_id: productId,
        };
      })
      .filter((item) => item !== null);
  });

  await prisma.cart_item.createMany({ data: cartItems });

  console.log("Seeding completed with Faker.js!");
};

main()
  .catch((e) => {
    console.error("Error:: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
