export type UserRole = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN'

export interface User {
  id: string
  email: string
  role: UserRole
  displayName?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Backend returns { status: "ok", data: { accessToken, refreshToken } } — no user object
export interface AuthResponse {
  status: string
  data: {
    accessToken: string
    refreshToken: string
  }
}

export interface RefreshResponse {
  status: string
  data: {
    accessToken: string
    refreshToken: string
  }
}

export interface JwtPayload {
  sub: string
  email: string
  role: UserRole
  jti: string
  iat: number
  exp: number
}

export interface OpeningHours {
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  description?: string
  cuisine?: string
  openingHours?: OpeningHours | string
  ownerId?: string
  createdAt?: string
  updatedAt?: string
}

export interface Dish {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  available: boolean
  imageUrl?: string
  restaurantId: string
  createdAt?: string
  updatedAt?: string
}

export interface AdminStats {
  status: string
  data: {
    users: number
    restaurants: number
    events: number
  }
}

export interface PaginatedUsers {
  status: string
  data: {
    users: User[]
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface RestaurantsListResponse {
  status: string
  data: Restaurant[]
}

export interface RestaurantResponse {
  status: string
  data: Restaurant
}

export interface DishesListResponse {
  status: string
  data: Dish[]
}

export interface DishResponse {
  status: string
  data: Dish
}

export type DishFormData = Omit<Dish, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>

export type RestaurantFormData = Omit<Restaurant, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
