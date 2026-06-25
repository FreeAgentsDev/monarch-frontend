package store

import (
	"context"
	"database/sql"
	"time"
)

func (s *Store) ListShops() ([]Shop, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, `
		SELECT id, domain, display_name, country_code, currency,
		       timezone, is_active, last_sync_at, sync_status, orders_count,
		       shopify_store_id
		FROM shops
		ORDER BY display_name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shops []Shop
	for rows.Next() {
		var sh Shop
		var lastSyncAt sql.NullTime
		if err := rows.Scan(
			&sh.ID, &sh.ShopifyDomain, &sh.ShopifyStoreName,
			&sh.CountryCode, &sh.Currency, &sh.Timezone,
			&sh.IsActive, &lastSyncAt, &sh.SyncStatus,
			&sh.OrdersCount, &sh.ShopifyStoreID,
		); err != nil {
			return nil, err
		}
		if lastSyncAt.Valid {
			sh.LastSyncAt = lastSyncAt.Time.UTC().Format(time.RFC3339)
		}
		shops = append(shops, sh)
	}
	return shops, rows.Err()
}

func (s *Store) StartShopSync(shopID string) (Shop, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var sh Shop
	var lastSyncAt sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		UPDATE shops
		SET sync_status = 'syncing', last_sync_at = now()
		WHERE id = $1
		RETURNING id, domain, display_name, country_code, currency,
		          timezone, is_active, last_sync_at, sync_status,
		          orders_count, shopify_store_id
	`, shopID).Scan(
		&sh.ID, &sh.ShopifyDomain, &sh.ShopifyStoreName,
		&sh.CountryCode, &sh.Currency, &sh.Timezone,
		&sh.IsActive, &lastSyncAt, &sh.SyncStatus,
		&sh.OrdersCount, &sh.ShopifyStoreID,
	)
	if err == sql.ErrNoRows {
		return Shop{}, false, nil
	}
	if err != nil {
		return Shop{}, false, err
	}
	if lastSyncAt.Valid {
		sh.LastSyncAt = lastSyncAt.Time.UTC().Format(time.RFC3339)
	}
	return sh, true, nil
}