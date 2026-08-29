import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export type CartItem = {
  service_id: string;
  name: string;
  price: number;
  image_url?: string | null;
  category?: string;
  available_individually?: boolean;
  quantity: number;
};

export type CartData = {
  id?: string;
  items: CartItem[];
  item_count: number;
  total: number;
  updatedAt?: string;
};

const getAuthConfig = (token: string | null) => ({
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
});

const normalizeCartItem = (item: any): CartItem => {
  const service = item.service || (typeof item.service_id === 'object' ? item.service_id : null) || {};
  const serviceId =
    (typeof item.service_id === 'string' ? item.service_id : null) ||
    service._id ||
    '';

  return {
    service_id: serviceId,
    name: service.name || 'Service',
    price: Number(service.price ?? 0),
    image_url: service.image_url,
    category: service.category_id?.name,
    available_individually: service.available_individually,
    quantity: Number(item.quantity || 1),
  };
};

const parseCartResponse = (data: any): CartData => {
  const cart = data.cart || {};
  const items: CartItem[] = (cart.items || []).map(normalizeCartItem);

  return {
    id: cart.id,
    items,
    item_count: cart.item_count ?? items.length,
    total: cart.total ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    updatedAt: cart.updatedAt,
  };
};

export const fetchCart = async (token: string | null): Promise<CartData> => {
  const res = await axios.get(`${apiUrl}/cart`, getAuthConfig(token));
  return parseCartResponse(res.data);
};

export const addServiceToCart = async (token: string | null, serviceId: string) => {
  const res = await axios.post(
    `${apiUrl}/services/individual/${serviceId}/cart`,
    {},
    getAuthConfig(token)
  );
  return parseCartResponse(res.data);
};

export const removeServiceFromCart = async (token: string | null, serviceId: string) => {
  const res = await axios.delete(`${apiUrl}/cart/items/${serviceId}`, getAuthConfig(token));
  return parseCartResponse(res.data);
};

export const clearServerCart = async (token: string | null) => {
  const res = await axios.delete(`${apiUrl}/cart`, getAuthConfig(token));
  return res.data;
};

const getServiceImage = (name: string, imageUrl?: string | null) => {
  if (imageUrl?.trim()) return imageUrl;
  const initial = name.trim().charAt(0).toUpperCase() || 'S';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=C4FE01&color=000000&size=256&bold=true&format=png`;
};

export { getServiceImage };
