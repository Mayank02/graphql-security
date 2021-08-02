const { getProducts, createProduct, getProduct } = require("../db/products");
const { login, updateUser } = require("../db/users");
const {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} = require("apollo-server");

module.exports = {
  Query: {
    products: () => getProducts()
  },
  Mutation: {
    createProduct: (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must log in to create new products."
        );
      }
      if (context.user.role !== "admin") {
        throw new ForbiddenError("You must be an admin to create Products.");
      }
      if (args.input.name.length < 3) {
        throw new UserInputError("Form Arguments invalid", {
          invalidArgs: ["input.name"]
        });
      }

      return { product: createProduct(args.input) };
    },
    login: (_parent, args) => {
      return login(args.input.email, args.input.password);
    },
    addProductToCart: (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "User must be logged in to add a Product to the Cart."
        );
      }

      const product = getProduct(args.input.productId);
      if (!product) {
        throw new UserInputError("Product doesn't exist", {
          invalidArgs: ["input.productId"]
        });
      }
      if (product.stock < args.input.amount) {
        throw new UserInputError(
          "Not enough items in stock for this product.",
          {
            invalidArgs: ["input.amount"]
          }
        );
      }
      return { amount: args.input.amount };
    }
  }
};
