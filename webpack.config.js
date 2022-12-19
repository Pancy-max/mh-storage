const path = require("path");
module.exports = {
  mode: "production",
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "mh-storage.min.js",
    libraryTarget: "umd",
    libraryExport: "default",
    globalObject: "this",
    library: "MHStorage"
  },
  module: {
    rules: [
      { 
          test: /\.js$/, 
          exclude: /node_modules/, 
          loader: "babel-loader",
          options: {
            presets: ['env']
          }
      }
    ]
  }
  
}

