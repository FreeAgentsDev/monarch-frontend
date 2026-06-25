package store

import (
	"context"
	"database/sql"
	"time"
)

func (s *Store) ListOrders() ([]Order, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT
			o.id,
			o.shopify_order_id,
			sh.shopify_store_id,
			o.store_name,
			o.order_number,
			o.customer_email,
			o.customer_name,
			o.total_amount,
			o.currency,
			o.internal_status,
			o.country_code,
			o.created_at,
			o.updated_at
		FROM orders o
		JOIN shops sh ON sh.id = o.shop_id
		ORDER BY o.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []Order
	for rows.Next() {
		var o Order
		var createdAt, updatedAt time.Time
		err := rows.Scan(
			&o.ID,
			&o.ShopifyOrderID,
			&o.ShopifyStoreID,
			&o.StoreName,
			&o.OrderNumber,
			&o.CustomerEmail,
			&o.CustomerName,
			&o.TotalAmount,
			&o.Currency,
			&o.Status,
			&o.CountryCode,
			&createdAt,
			&updatedAt,
		)
		if err != nil {
			return nil, err
		}
		o.CreatedAt = createdAt.UTC().Format(time.RFC3339)
		o.UpdatedAt = updatedAt.UTC().Format(time.RFC3339)

		o.Items, err = s.getOrderItems(ctx, o.ID)
		if err != nil {
			return nil, err
		}

		orders = append(orders, o)
	}
	return orders, rows.Err()
}

func (s *Store) GetOrder(id string) (Order, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var o Order
	var createdAt, updatedAt time.Time
	err := s.db.QueryRowContext(ctx, `
		SELECT
			o.id,
			o.shopify_order_id,
			sh.shopify_store_id,
			o.store_name,
			o.order_number,
			o.customer_email,
			o.customer_name,
			o.total_amount,
			o.currency,
			o.internal_status,
			o.country_code,
			o.created_at,
			o.updated_at
		FROM orders o
		JOIN shops sh ON sh.id = o.shop_id
		WHERE o.id = $1
	`, id).Scan(
		&o.ID,
		&o.ShopifyOrderID,
		&o.ShopifyStoreID,
		&o.StoreName,
		&o.OrderNumber,
		&o.CustomerEmail,
		&o.CustomerName,
		&o.TotalAmount,
		&o.Currency,
		&o.Status,
		&o.CountryCode,
		&createdAt,
		&updatedAt,
	)
	if err == sql.ErrNoRows {
		return Order{}, false, nil
	}
	if err != nil {
		return Order{}, false, err
	}
	o.CreatedAt = createdAt.UTC().Format(time.RFC3339)
	o.UpdatedAt = updatedAt.UTC().Format(time.RFC3339)
	o.Items, err = s.getOrderItems(ctx, o.ID)
	if err != nil {
		return Order{}, false, err
	}
	return o, true, nil
}

func (s *Store) UpdateOrderStatus(id, status string) (Order, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var o Order
	var createdAt, updatedAt time.Time
	err := s.db.QueryRowContext(ctx, `
		UPDATE orders
		SET internal_status = $1, updated_at = now()
		WHERE id = $2
		RETURNING
			id, shopify_order_id, store_name, order_number,
			customer_email, customer_name, total_amount, currency,
			internal_status, country_code, created_at, updated_at
	`, status, id).Scan(
		&o.ID,
		&o.ShopifyOrderID,
		&o.StoreName,
		&o.OrderNumber,
		&o.CustomerEmail,
		&o.CustomerName,
		&o.TotalAmount,
		&o.Currency,
		&o.Status,
		&o.CountryCode,
		&createdAt,
		&updatedAt,
	)
	if err == sql.ErrNoRows {
		return Order{}, false, nil
	}
	if err != nil {
		return Order{}, false, err
	}
	o.CreatedAt = createdAt.UTC().Format(time.RFC3339)
	o.UpdatedAt = updatedAt.UTC().Format(time.RFC3339)
	return o, true, nil
}

func (s *Store) getOrderItems(ctx context.Context, orderID any) ([]OrderItem, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, external_product_id, external_variant_id,
		       sku, title, quantity, price, line_total
		FROM order_items
		WHERE order_id = $1
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []OrderItem
	for rows.Next() {
		var it OrderItem
		if err := rows.Scan(
			&it.ID,
			&it.ProductID,
			&it.VariantID,
			&it.SKU,
			&it.Title,
			&it.Quantity,
			&it.Price,
			&it.Total,
		); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, rows.Err()
}