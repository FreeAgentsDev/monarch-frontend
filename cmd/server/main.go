package main

import (
	"log"

	"monarch-backend/internal/config"
	"monarch-backend/internal/handlers"
	"monarch-backend/internal/router"
	"monarch-backend/internal/store"
)

func main() {
	cfg := config.Load()

	st, err := store.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("no se pudo conectar a la base de datos: %v", err)
	}
	defer st.Close()

	h := handlers.New(st)
	r := router.New(cfg, h)
	log.Printf("escuchando en %s", cfg.Addr())
	if err := r.Run(cfg.Addr()); err != nil {
		log.Fatal(err)
	}
}