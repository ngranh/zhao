const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/main.ts",
  module: {
    rules: [
      {
        include: /src/,
        use: ["style-loader", "css-loader", "sass-loader"],
        test: /\.s[ac]ss$/,
      },
      { include: /src/, loader: "ts-loader", test: /\.tsx?$/ },
      { include: /data/, loader: "yaml-loader", test: /\.ya?ml$/ },
    ],
  },
  output: { filename: "bundle.js", path: path.resolve(__dirname, "dist") },
  plugins: [new HtmlWebpackPlugin({ template: "src/index.html" })],
  resolve: { extensions: [".tsx", ".ts", ".js"] },
};
