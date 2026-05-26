package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"monarch-backend/internal/store"
)

var orderStatuses = map[string]struct{}{
	"pending": {}, "processing": {}, "shipped": {},
	"delivered": {}, "cancelled": {},
}

func (h *Handlers) ListOrders(c *gin.Context) {
	orders, err := h.store.ListOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	q := store.OrderQuery{
		Status: c.Query("status"), Country: c.Query("country"),
		StoreID: c.Query("storeId"), CustomerEmail: c.Query("customerEmail"),
		Search: c.Query("search"), DateFrom: c.Query("dateFrom"),
		DateTo: c.Query("dateTo"), MinAmount: c.Query("minAmount"),
		MaxAmount: c.Query("maxAmount"), SortBy: c.Query("sortBy"),
		SortOrder: c.Query("sortOrder"),
		Page: atoiQuery(c, "page", 0), Limit: atoiQuery(c, "limit", 0),
	}
	c.JSON(http.StatusOK, store.FilterOrders(orders, q))
}

func (h *Handlers) GetOrder(c *gin.Context) {
	o, ok, err := h.store.GetOrder(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	c.JSON(http.StatusOK, o)
}

type patchOrderBody struct {
	Status string `json:"status"`
}

func (h *Handlers) PatchOrder(c *gin.Context) {
	var body patchOrderBody
	if err := c.ShouldBindJSON(&body); err != nil || body.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "body must include status"})
		return
	}
	if _, ok := orderStatuses[body.Status]; !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
		return
	}
	o, ok, err := h.store.UpdateOrderStatus(c.Param("id"), body.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	c.JSON(http.StatusOK, o)
}

func atoiQuery(c *gin.Context, key string, def int) int {
	s := c.Query(key)
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return n
}