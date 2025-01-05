package api

import (
	"github.com/gin-gonic/gin"
	"github.com/jscyril/filely/internal/handlers"
)

func RegisterRoutes(router *gin.Engine) {
	// File-sharing routes
	router.POST("/upload", handlers.UploadFile)
	router.GET("/download/:id", handlers.DownloadFile)

	// WebRTC signaling routes
	router.POST("/signal", handlers.SignalHandler)
}
