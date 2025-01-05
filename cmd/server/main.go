package main

import (
    "github.com/gin-gonic/gin"
    "github.com/jscyril/Filely/api"
)

func main() {
    router := gin.Default()

    // Initialize routes
    api.RegisterRoutes(router)

    // Start the server
    router.Run(":8080")
}
