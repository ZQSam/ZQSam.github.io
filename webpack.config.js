const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "source-map",
  devServer: {
    static: { directory: path.resolve(__dirname, "build") },
    open: true,
    hot: true,
    host: "localhost",
    watchFiles: "src/**/*.html",
  },
  context: path.join(__dirname, "src"),
  entry: "./index.js",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: "babel-loader",
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
        // Keep readable asset URLs; CopyPlugin emits each static asset once.
        options: { sources: false },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "./assets/",
          to: "./assets/",
          globOptions: {
            ignore: [
              "**/bg-*",
              "**/3.png",
              "**/4.jpeg",
              "**/5.png",
              "**/6.jpeg",
            ],
          },
        },
        { from: "./.nojekyll", to: "./.nojekyll", noErrorOnMissing: true },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "index.html",
      inject: "body",
    }),
    new HtmlWebpackPlugin({
      template: "financial-agent.html",
      filename: "financial-agent.html",
      inject: "body",
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
};
