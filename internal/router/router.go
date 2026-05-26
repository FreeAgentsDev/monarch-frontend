package router

import (
	"github.com/gin-gonic/gin"

	"monarch-backend/internal/config"
	"monarch-backend/internal/handlers"
)

func New(cfg config.Config, h *handlers.Handlers) *gin.Engine {
	_ = cfg // reserved (e.g. trusted proxies, CORS origins from env)

	r := gin.Default()
	r.Use(corsMiddleware())

	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", h.Health)
		v1.GET("/orders", h.ListOrders)
		v1.GET("/orders/:id", h.GetOrder)
		v1.PATCH("/orders/:id", h.PatchOrder)
		v1.GET("/shops", h.ListShops)
		v1.POST("/shops/:id/sync", h.SyncShop)
	}

	return r
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
