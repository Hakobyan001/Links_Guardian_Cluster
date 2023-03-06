const express = require("express")
const Api = require('./src/api/urls.api');
const ErrorHandlerMiddlware = require('./src/validation/error-handler.middleware');

const app = express()

const PORT = process.env.PORT || 8080

app.use(express.json())

app.use('/api/v1', Api);
app.use(ErrorHandlerMiddlware.init);



    app.listen(PORT, () => {
    console.log(`Server is connected on port ${PORT}`);
})


module.exports = app