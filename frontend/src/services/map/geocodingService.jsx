import axios from "axios";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

// Normaliza strings para comparaciones (quita acentos y pasa a lower)
export const normalize = (str = "") =>
  str
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .trim();

// Reverse geocoding con Mapbox: devuelve direccion, ciudad y region (departamento)
export const reverseGeocode = async (lat, lng) => {
  if (!MAPBOX_TOKEN) throw new Error("Falta REACT_APP_MAPBOX_TOKEN");
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;
  const params = {
    access_token: MAPBOX_TOKEN,
    language: "es",
    limit: 1,
    types: "address,place,locality,neighborhood,region",
  };
  const { data } = await axios.get(url, { params });
  const feature = data?.features?.[0];
  if (!feature) return null;

  const placeName = feature.place_name || "";
  let city = "";
  let region = "";

  const ctx = feature.context || [];
  // context ids: place.<id> (ciudad), region.<id> (departamento/provincia)
  for (const c of ctx) {
    if (c.id?.startsWith("place")) city = c.text || city;
    if (c.id?.startsWith("locality") && !city) city = c.text || city; // fallback
    if (c.id?.startsWith("region")) region = c.text || region;
  }
  // A veces la ciudad viene en feature.text si types=place
  if (!city && feature.place_type?.includes("place")) city = feature.text || city;

  return {
    address: placeName,
    city,
    region,
    center: feature.center, // [lng, lat]
  };
};
