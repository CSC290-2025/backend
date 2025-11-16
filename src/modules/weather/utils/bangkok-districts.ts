export const bangkokDistricts = [
  {
    location_id: 1,
    name: 'Thung Khru',
    lat: 13.632160030710809,
    lng: 100.4911907279456,
  },
  { location_id: 2, name: 'Rat Burana', lat: 13.684452, lng: 100.6 },
  { location_id: 3, name: 'Thon Buri', lat: 13.720639, lng: 100.488936 },
  { location_id: 4, name: 'Chom Thong', lat: 13.687762, lng: 100.477365 },
];

export const getDistrictByLocationId = (locationId: number) => {
  return bangkokDistricts.find((d) => d.location_id === locationId);
};
