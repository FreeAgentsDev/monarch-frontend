package store

import (
	"strconv"
	"strings"
	"time"
)

type OrderQuery struct {
	Status, Country, StoreID, CustomerEmail, Search string
	DateFrom, DateTo, MinAmount, MaxAmount             string
	SortBy, SortOrder                                 string
	Page, Limit                                       int
}

func FilterOrders(orders []Order, q OrderQuery) []Order {
	filtered := append([]Order(nil), orders...)

	if q.Status != "" {
		next := filtered[:0]
		for _, o := range filtered {
			if o.Status == q.Status {
				next = append(next, o)
			}
		}
		filtered = next
	}
	if q.Country != "" {
		next := filtered[:0]
		for _, o := range filtered {
			if o.CountryCode == q.Country {
				next = append(next, o)
			}
		}
		filtered = next
	}
	if q.StoreID != "" {
		next := filtered[:0]
		for _, o := range filtered {
			if o.ShopifyStoreID == q.StoreID {
				next = append(next, o)
			}
		}
		filtered = next
	}
	if q.CustomerEmail != "" {
		needle := strings.ToLower(q.CustomerEmail)
		next := filtered[:0]
		for _, o := range filtered {
			if strings.Contains(strings.ToLower(o.CustomerEmail), needle) {
				next = append(next, o)
			}
		}
		filtered = next
	}
	if q.Search != "" {
		term := strings.ToLower(q.Search)
		next := filtered[:0]
		for _, o := range filtered {
			if strings.Contains(strings.ToLower(o.OrderNumber), term) ||
				strings.Contains(strings.ToLower(o.CustomerName), term) ||
				strings.Contains(strings.ToLower(o.CustomerEmail), term) {
				next = append(next, o)
			}
		}
		filtered = next
	}
	if q.DateFrom != "" {
		if t0, err := time.Parse(time.RFC3339, q.DateFrom); err == nil {
			next := filtered[:0]
			for _, o := range filtered {
				if t1, err := time.Parse(time.RFC3339, o.CreatedAt); err == nil && !t1.Before(t0) {
					next = append(next, o)
				}
			}
			filtered = next
		}
	}
	if q.DateTo != "" {
		if t0, err := time.Parse(time.RFC3339, q.DateTo); err == nil {
			next := filtered[:0]
			for _, o := range filtered {
				if t1, err := time.Parse(time.RFC3339, o.CreatedAt); err == nil && !t1.After(t0) {
					next = append(next, o)
				}
			}
			filtered = next
		}
	}
	if q.MinAmount != "" {
		if min, err := strconv.ParseFloat(q.MinAmount, 64); err == nil {
			next := filtered[:0]
			for _, o := range filtered {
				if o.TotalAmount >= min {
					next = append(next, o)
				}
			}
			filtered = next
		}
	}
	if q.MaxAmount != "" {
		if max, err := strconv.ParseFloat(q.MaxAmount, 64); err == nil {
			next := filtered[:0]
			for _, o := range filtered {
				if o.TotalAmount <= max {
					next = append(next, o)
				}
			}
			filtered = next
		}
	}

	sortOrder := q.SortOrder
	if sortOrder == "" {
		sortOrder = "desc"
	}
	if q.SortBy != "" {
		filtered = sortOrdersByField(filtered, q.SortBy, sortOrder)
	} else {
		filtered = sortOrdersByField(filtered, "createdAt", "desc")
	}

	if q.Page > 0 || q.Limit > 0 {
		page := q.Page
		if page < 1 {
			page = 1
		}
		limit := q.Limit
		if limit < 1 {
			limit = 10
		}
		start := (page - 1) * limit
		if start > len(filtered) {
			return []Order{}
		}
		end := start + limit
		if end > len(filtered) {
			end = len(filtered)
		}
		filtered = filtered[start:end]
	}

	return filtered
}

func sortOrdersByField(orders []Order, field, order string) []Order {
	asc := order == "asc"
	less := func(i, j int) bool { return false }
	switch field {
	case "createdAt":
		less = func(i, j int) bool {
			ti, _ := time.Parse(time.RFC3339, orders[i].CreatedAt)
			tj, _ := time.Parse(time.RFC3339, orders[j].CreatedAt)
			if asc {
				return ti.Before(tj)
			}
			return ti.After(tj)
		}
	case "updatedAt":
		less = func(i, j int) bool {
			ti, _ := time.Parse(time.RFC3339, orders[i].UpdatedAt)
			tj, _ := time.Parse(time.RFC3339, orders[j].UpdatedAt)
			if asc {
				return ti.Before(tj)
			}
			return ti.After(tj)
		}
	case "totalAmount":
		less = func(i, j int) bool {
			if asc {
				return orders[i].TotalAmount < orders[j].TotalAmount
			}
			return orders[i].TotalAmount > orders[j].TotalAmount
		}
	case "orderNumber":
		less = func(i, j int) bool {
			if asc {
				return orders[i].OrderNumber < orders[j].OrderNumber
			}
			return orders[i].OrderNumber > orders[j].OrderNumber
		}
	case "status":
		less = func(i, j int) bool {
			if asc {
				return orders[i].Status < orders[j].Status
			}
			return orders[i].Status > orders[j].Status
		}
	default:
		less = func(i, j int) bool {
			ti, _ := time.Parse(time.RFC3339, orders[i].CreatedAt)
			tj, _ := time.Parse(time.RFC3339, orders[j].CreatedAt)
			if asc {
				return ti.Before(tj)
			}
			return ti.After(tj)
		}
	}
	// insertion sort slice stable enough for small n
	for i := 1; i < len(orders); i++ {
		for j := i; j > 0 && less(j, j-1); j-- {
			orders[j], orders[j-1] = orders[j-1], orders[j]
		}
	}
	return orders
}

type ShopQuery struct {
	IsActive   *bool
	CountryCode, SyncStatus, Currency string
	SortBy, SortOrder                 string
	Page, Limit                       int
}

func FilterShops(shops []Shop, q ShopQuery) []Shop {
	filtered := append([]Shop(nil), shops...)

	if q.IsActive != nil {
		next := filtered[:0]
		for _, s := range filtered {
			if s.IsActive == *q.IsActive {
				next = append(next, s)
			}
		}
		filtered = next
	}
	if q.CountryCode != "" {
		next := filtered[:0]
		for _, s := range filtered {
			if s.CountryCode == q.CountryCode {
				next = append(next, s)
			}
		}
		filtered = next
	}
	if q.SyncStatus != "" {
		next := filtered[:0]
		for _, s := range filtered {
			if s.SyncStatus == q.SyncStatus {
				next = append(next, s)
			}
		}
		filtered = next
	}
	if q.Currency != "" {
		cur := strings.ToUpper(q.Currency)
		next := filtered[:0]
		for _, s := range filtered {
			if strings.ToUpper(s.Currency) == cur {
				next = append(next, s)
			}
		}
		filtered = next
	}

	sortOrder := q.SortOrder
	if sortOrder == "" {
		sortOrder = "asc"
	}
	if q.SortBy != "" {
		filtered = sortShopsByField(filtered, q.SortBy, sortOrder)
	}

	if q.Page > 0 || q.Limit > 0 {
		page := q.Page
		if page < 1 {
			page = 1
		}
		limit := q.Limit
		if limit < 1 {
			limit = 10
		}
		start := (page - 1) * limit
		if start > len(filtered) {
			return []Shop{}
		}
		end := start + limit
		if end > len(filtered) {
			end = len(filtered)
		}
		filtered = filtered[start:end]
	}

	return filtered
}

func sortShopsByField(shops []Shop, field, order string) []Shop {
	asc := order == "asc"
	less := func(i, j int) bool { return false }
	switch field {
	case "shopifyStoreName":
		less = func(i, j int) bool {
			if asc {
				return shops[i].ShopifyStoreName < shops[j].ShopifyStoreName
			}
			return shops[i].ShopifyStoreName > shops[j].ShopifyStoreName
		}
	case "ordersCount":
		less = func(i, j int) bool {
			if asc {
				return shops[i].OrdersCount < shops[j].OrdersCount
			}
			return shops[i].OrdersCount > shops[j].OrdersCount
		}
	case "lastSyncAt":
		less = func(i, j int) bool {
			ti, _ := time.Parse(time.RFC3339, shops[i].LastSyncAt)
			tj, _ := time.Parse(time.RFC3339, shops[j].LastSyncAt)
			if asc {
				return ti.Before(tj)
			}
			return ti.After(tj)
		}
	default:
		less = func(i, j int) bool {
			return shops[i].ShopifyStoreName < shops[j].ShopifyStoreName
		}
		if !asc {
			less = func(i, j int) bool {
				return shops[i].ShopifyStoreName > shops[j].ShopifyStoreName
			}
		}
	}
	for i := 1; i < len(shops); i++ {
		for j := i; j > 0 && less(j, j-1); j-- {
			shops[j], shops[j-1] = shops[j-1], shops[j]
		}
	}
	return shops
}
