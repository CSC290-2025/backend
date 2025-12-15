import { LocationIQSchemas } from '../schemas/index';
export async function LatLongConverter(q: string) {
  const url = `https://us1.locationiq.com/v1/search?q=${encodeURIComponent(q)}&accept-language=en%2C%20th&countrycodes=th&key=pk.d84d79928fa442aae1e0da75564b2ab1`;
  const options = { method: 'GET', headers: { accept: 'application/json' } };
  const response = await fetch(url, options)
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch((err) => console.error(err));

  return LocationIQSchemas.latLongSchema.parse(response);
}
