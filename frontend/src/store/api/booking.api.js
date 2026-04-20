import { baseApi } from "./base.api";

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /bookings/my  — customer's own bookings
    getMyBookings: builder.query({
      query: () => "/bookings/my",
      providesTags: ["Booking"],
    }),

    getOwnerBookings: builder.query({
      query: () => "/bookings/owner",
      providesTags: ["Booking"],
    }),

    // POST /bookings
    addBooking: builder.mutation({
      query: (data) => ({
        url: "/bookings",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Booking"],
    }),

    // PUT /bookings/:id
    updateBooking: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/bookings/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Booking"],
    }),

    // PATCH /bookings/:id/cancel
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Booking"],
    }),

  }),
});

export const {
  useGetMyBookingsQuery,
  useGetOwnerBookingsQuery,
  useAddBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingMutation,
} = bookingApi;
