import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  // Clear existing data
  await prisma.cart_item.deleteMany({});
  await prisma.order_item.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product_inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.user_address.deleteMany({});
  await prisma.payment_method.deleteMany({});
  await prisma.user_role.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.product_category.deleteMany({});

  // Create Roles (only 3 roles)
  const roles = ["Admin", "Customer", "Supplier"];
  const createdRoles = await Promise.all(
    roles.map((role) =>
      prisma.role.create({
        data: { role: role },
      })
    )
  );

  // Create Users
  const createdUsers = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.userName(),
          password_hash: faker.internet.password(),
          full_name: faker.person.fullName(),
          phone_number: faker.phone.number(),
          created_by: faker.datatype.number({ min: 1, max: 10 }),
          updated_by: faker.datatype.number({ min: 1, max: 10 }),
        },
      })
    )
  );

  // Create User_Roles
  const userRoles = await Promise.all(
    createdUsers.flatMap((user) =>
      createdRoles.map((role) =>
        prisma.user_role.create({
          data: {
            user_id: user.id,
            role_id: role.id,
          },
        })
      )
    )
  );

  // Create User_Addresses
  const userAddresses = await Promise.all(
    createdUsers.map((user) =>
      prisma.user_address.create({
        data: {
          address_line1: faker.address.streetAddress(),
          address_line2: faker.address.secondaryAddress(),
          city: faker.address.city(),
          country: faker.address.country(),
          postal_code: faker.address.zipCode(),
          user_id: user.id,
        },
      })
    )
  );

  // Create Discounts with unique names
  const discountNames = [];
  const createdDiscounts = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      let name;
      do {
        name = faker.commerce.productName();
      } while (discountNames.includes(name));
      discountNames.push(name);
      return prisma.discount.create({
        data: {
          name: name,
          desc: faker.lorem.sentence(),
          discount_percent: faker.datatype.number({
            min: 5,
            max: 50,
            precision: 0.01,
          }),
          active: faker.datatype.boolean(),
        },
      });
    })
  );

  // Create Product_Categories with unique names
  const categoryNames = [];
  const createdCategories = await Promise.all(
    Array.from({ length: 10 }).map(() => {
      let name;
      do {
        name = faker.commerce.department();
      } while (categoryNames.includes(name));
      categoryNames.push(name);
      return prisma.product_category.create({
        data: {
          name: name,
          desc: faker.lorem.sentence(),
        },
      });
    })
  );

  // Create Products
  const createdProducts = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      const category = faker.helpers.arrayElement(createdCategories);
      const discount = faker.helpers.arrayElement(createdDiscounts);
      return prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          price: parseFloat(faker.commerce.price()),
          created_at: new Date(),
          updated_at: new Date(),
          category_id: category.id,
          discount_id: discount.id,
        },
      });
    })
  );

  // Create Product_Inventory
  const productInventories = await Promise.all(
    createdProducts.map((product) =>
      prisma.product_inventory.create({
        data: {
          quantity: faker.datatype.number({ min: 1, max: 100 }),
          product_id: product.id,
        },
      })
    )
  );

  // Create Orders
  const createdOrders = await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.order.create({
        data: {
          total: parseFloat(faker.commerce.price()),
          order_status: "PENDING",
          created_at: new Date(),
          updated_at: new Date(),
          user_id: faker.helpers.arrayElement(createdUsers).id,
          payments: {
            create: [
              {
                amount: parseFloat(faker.commerce.price()),
                payment_status: true,
                payment_date: new Date(),
              },
            ],
          },
        },
      })
    )
  );

  // Create Order_Items with unique product_id per order_id
  await Promise.all(
    createdOrders.map(async (order) => {
      const productIds = new Set();
      while (productIds.size < 5) {
        productIds.add(faker.helpers.arrayElement(createdProducts).id);
      }

      return Promise.all(
        Array.from(productIds).map((productId) =>
          prisma.order_item.create({
            data: {
              quantity: faker.datatype.number({ min: 1, max: 10 }),
              order_id: order.id,
              product_id: productId,
            },
          })
        )
      );
    })
  );

  // Create Shopping_Sessions
  const createdShoppingSessions = await Promise.all(
    createdUsers.map((user) =>
      prisma.shopping_session.create({
        data: {
          total: parseFloat(
            faker.commerce.price({ min: 1, max: 1000, precision: 0.01 })
          ),
          user_id: user.id,
        },
      })
    )
  );

  // Create Cart_Items
  await Promise.all(
    createdShoppingSessions.flatMap((shoppingSession) =>
      createdProducts.map((product) =>
        prisma.cart_item.create({
          data: {
            quantity: faker.datatype.number({ min: 1, max: 10 }),
            shopping_session_id: shoppingSession.id,
            product_id: product.id,
          },
        })
      )
    )
  );

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
