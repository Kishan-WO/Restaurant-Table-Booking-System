/* eslint-disable no-unused-vars */
import { baseApi } from "./base.api";

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /restaurants  — all restaurants (customer view)
    getRestaurants: builder.query({
      query: () => "/restaurants",
      providesTags: ["Restaurant"],
    }),

    getMyRestaurants: builder.query({
      query: () => "/restaurants/my",
      providesTags: ["Restaurant"],
    }),

    // GET /restaurants/:id  — single restaurant detail
    getRestaurantById: builder.query({
      query: (id) => `/restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: "Restaurant", id }],
    }),

    // POST /restaurants
    addRestaurant: builder.mutation({
      query: (data) => ({
        url: "/restaurants",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Restaurant"],
    }),

    // PUT /restaurants/:id
    updateRestaurant: builder.mutation({
      query: ({ _id, ownerId, ...data }) => ({
        url: `/restaurants/${_id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { _id }) => [
        "Restaurant",
        { type: "Restaurant", id: _id },
      ],
    }),

    // DELETE /restaurants/:id
    deleteRestaurant: builder.mutation({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Restaurant"],
    }),

    // GET /restaurants/:restaurantId/hours
    getOperatingHours: builder.query({
      query: (restaurantId) => `/restaurants/${restaurantId}/hours`,
      providesTags: (result, error, restaurantId) => [
        { type: "OperatingHours", id: restaurantId },
      ],
    }),

    // PUT /restaurants/:restaurantId/hours
    updateOperatingHours: builder.mutation({
      query: ({ restaurantId, openingHours }) => ({
        url: `/restaurants/${restaurantId}/hours`,
        method: "PUT",
        body: { ...openingHours },
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: "OperatingHours", id: restaurantId },
      ],
    }),

    // GET /restaurants/:resId/tables
    getTablesByRestaurant: builder.query({
      query: ({ resId, date, startTime }) => {
        if (date === undefined) {
          return `/restaurants/${resId}/tables`;
        }

        const d = new Date(date);

        const [hours, minutes] = startTime.split(":");
        if (isNaN(hours) || isNaN(minutes)) {
          console.error("Invalid time values:", startTime);
          return `/restaurants/${resId}/tables`;
        }

        d.setHours(hours, minutes, 0, 0);

        if (isNaN(d.getTime())) {
          console.error("Invalid Date after setting time:", d);
          return `/restaurants/${resId}/tables`;
        }

        return `/restaurants/${resId}/tables?startTime=${d.toISOString()}`;
        // d.setHours(hours, minutes, 0, 0);

        // console.log(resId, d);
        // return `/restaurants/${resId}/tables?startTime=${d.toISOString()}`;
      },
      providesTags: (result, error, { resId }) => [
        { type: "Table", id: resId },
      ],
    }),

    // GET /restaurants/:resId/tables/:tableId
    getTableById: builder.query({
      query: ({ resId, tableId }) => `/restaurants/${resId}/tables/${tableId}`,
      providesTags: (result, error, { tableId }) => [
        { type: "Table", id: tableId },
      ],
    }),

    // POST /restaurants/:resId/tables
    addTable: builder.mutation({
      query: ({ restaurantId, ...table }) => ({
        url: `/restaurants/${restaurantId}/tables`,
        method: "POST",
        body: table,
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: "Table", id: restaurantId },
      ],
    }),

    // PUT /restaurants/:resId/tables/:tableId
    updateTable: builder.mutation({
      query: ({ restaurantId, tableId, ...table }) => ({
        url: `/restaurants/${restaurantId}/tables/${tableId}`,
        method: "PUT",
        body: table,
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: "Table", id: restaurantId },
      ],
    }),

    // DELETE /restaurants/:resId/tables/:tableId
    deleteTable: builder.mutation({
      query: ({ restaurantId, tableId }) => ({
        url: `/restaurants/${restaurantId}/tables/${tableId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { restaurantId }) => [
        { type: "Table", id: restaurantId },
      ],
    }),
  }),
});

export const {
  useGetRestaurantsQuery,
  useGetMyRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useAddRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetOperatingHoursQuery,
  useUpdateOperatingHoursMutation,
  useGetTablesByRestaurantQuery,
  useGetTableByIdQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} = restaurantApi;
