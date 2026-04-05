-- Migration to add lgbt_type column to events table
-- This allows storing the type of LGBT+ event (e.g., Lésbicas, Gays, Trans, etc.)

ALTER TABLE public.events
ADD COLUMN lgbt_type VARCHAR(20) DEFAULT '';

-- Add comment for documentation
COMMENT ON COLUMN public.events.lgbt_type IS 'Type of LGBT+ event (e.g., Lésbicas, Gays, Trans). Only used if is_lgbt_only is true. Max 20 characters.';
