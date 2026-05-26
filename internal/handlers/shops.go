package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"monarch-backend/internal/store"
)

func (h *Handlers) ListShops(c *gin.Context) {
	shops, err := h.store.ListShops()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	q := store.ShopQuery{
		CountryCode: c.Query("countryCode"), SyncStatus: c.Query("syncStatus"),
		Currency: c.Query("currency"), SortBy: c.Query("sortBy"),
		SortOrder: c.Query("sortOrder"),
		Page: atoiQuery(c, "page", 0), Limit: atoiQuery(c, "limit", 0),
	}
	if v := c.Query("isActive"); v != "" {
		b := v == "true" || v == "1"
		q.IsActive = &b
	}
	c.JSON(http.StatusOK, store.FilterShops(shops, q))
}

func (h *Handlers) SyncShop(c *gin.Context) {
	shop, ok, err := h.store.StartShopSync(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "shop not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sincronización iniciada",
		"shopId":  c.Param("id"),
		"shop":    shop,
	})
}