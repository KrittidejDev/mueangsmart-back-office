package domain

import (
	"context"
	"time"

	"github.com/google/uuid"
)

// GisPoint represents a single geospatial data point on the map
type GisPoint struct {
	ID             uuid.UUID `json:"id"`
	LayerType      string    `json:"layer_type"` // "complaint", "elderly", "bedridden", "cctv", "pet", "municipality", "sensor"
	Title          string    `json:"title"`
	Subtitle       string    `json:"subtitle,omitempty"`
	Category       string    `json:"category,omitempty"`
	Status         string    `json:"status,omitempty"`
	Latitude       float64   `json:"latitude"`
	Longitude      float64   `json:"longitude"`
	Address        string    `json:"address,omitempty"`
	CityID         uuid.UUID `json:"city_id"`
	CityName       string    `json:"city_name"`
	PhotoURL       string    `json:"photo_url,omitempty"`
	Contact        string    `json:"contact,omitempty"`
	CreatedDate    *time.Time `json:"created_date,omitempty"`
	ExtraMetadata  map[string]interface{} `json:"extra_metadata,omitempty"`
}

// GisLayerSummary contains statistics and configuration for each map layer
type GisLayerSummary struct {
	LayerKey    string  `json:"layer_key"`    // "complaints", "elderly", "bedridden", "cctv", "pets", "municipalities"
	NameTh      string  `json:"name_th"`
	NameEn      string  `json:"name_en"`
	Icon        string  `json:"icon"`
	Color       string  `json:"color"`
	Count       int64   `json:"count"`
	IsDefaultOn bool    `json:"is_default_on"`
}

// GisFilterRequest represents query parameters for fetching map points
type GisFilterRequest struct {
	CityID     *uuid.UUID `query:"city_id"`
	Layers     []string   `query:"layers"` // e.g. ["complaint", "elderly", "cctv"]
	Status     string     `query:"status"`
	Search     string     `query:"search"`
	MaxLimit   int        `query:"limit"`
}

// GisRepository defines data access methods for GIS coordinates
type GisRepository interface {
	GetLayerSummaries(ctx context.Context, cityID *uuid.UUID) ([]GisLayerSummary, error)
	GetPoints(ctx context.Context, filter GisFilterRequest) ([]GisPoint, error)
}

// GisUseCase defines business logic for GIS multi-layer mapping
type GisUseCase interface {
	GetLayerSummaries(ctx context.Context, cityID *uuid.UUID) ([]GisLayerSummary, error)
	GetPoints(ctx context.Context, filter GisFilterRequest) ([]GisPoint, error)
}
