package handlers

import (
	"github.com/gin-gonic/gin"

	"monarch-backend/internal/store"
)

type Handlers struct {
	store *store.Store
}

func New(s *store.Store) *Handlers {
	return &Handlers{store: s}
}

func (h *Handlers) Health(c *gin.Context) {
	c.JSON(200, gin.H{"status": "ok"})
}
