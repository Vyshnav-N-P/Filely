package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// UploadFile handles file uploads
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
		return
	}

	// Save the file locally or process it
	c.SaveUploadedFile(file, "./uploads/"+file.Filename)

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

// DownloadFile handles file downloads
func DownloadFile(c *gin.Context) {
	fileID := c.Param("id")
	// Retrieve the file based on fileID
	c.File("./uploads/" + fileID)
}
