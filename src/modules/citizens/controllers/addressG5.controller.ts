import type { Context, Handler } from 'hono';
import { addressService } from '../services/addressG5.service';
import type { AddressG5 } from '../types/addressG5.types';

export const addressController = {
  getUsersByDistrict: (async (c: Context) => {
    const district = c.req.query('district');

    if (!district) {
      return c.json(
        { success: false, message: 'District query parameter is required' },
        400
      );
    }

    const users = await addressService.getUsersByDistrict(district);

    const addresses: AddressG5[] = users
      .map((u) => u.address)
      .filter((a) => a !== null);

    return c.json({
      success: true,
      message: `Found ${addresses.length} addresses in district: ${district}`,
      data: {
        district,
        count: addresses.length,
        addresses,
      },
    });
  }) as Handler<any, any, any>,
};
