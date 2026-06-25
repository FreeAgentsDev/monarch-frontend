package store

type Order struct {
	ID               string      `json:"id"`
	ShopifyOrderID   string      `json:"shopifyOrderId"`
	ShopifyStoreID   string      `json:"shopifyStoreId"`
	StoreName        string      `json:"storeName"`
	OrderNumber      string      `json:"orderNumber"`
	CustomerEmail    string      `json:"customerEmail"`
	CustomerName     string      `json:"customerName"`
	TotalAmount      float64     `json:"totalAmount"`
	Currency         string      `json:"currency"`
	Status           string      `json:"status"`
	CountryCode      string      `json:"countryCode"`
	Country          string      `json:"country"`
	CreatedAt        string      `json:"createdAt"`
	UpdatedAt        string      `json:"updatedAt"`
	Items            []OrderItem `json:"items"`
}

type OrderItem struct {
	ID        string  `json:"id"`
	ProductID string  `json:"productId"`
	VariantID string  `json:"variantId"`
	SKU       string  `json:"sku"`
	Title     string  `json:"title"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
	Total     float64 `json:"total"`
}

type Shop struct {
	ID                string `json:"id"`
	ShopifyDomain     string `json:"shopifyDomain"`
	ShopifyStoreID    string `json:"shopifyStoreId"`
	ShopifyStoreName  string `json:"shopifyStoreName"`
	CountryCode       string `json:"countryCode"`
	Country           string `json:"country"`
	Currency          string `json:"currency"`
	Timezone          string `json:"timezone"`
	IsActive          bool   `json:"isActive"`
	LastSyncAt        string `json:"lastSyncAt"`
	SyncStatus        string `json:"syncStatus"`
	OrdersCount       int    `json:"ordersCount"`
}
