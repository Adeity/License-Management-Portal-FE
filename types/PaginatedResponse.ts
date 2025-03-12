// types/PaginatedResponse.ts
export interface PaginatedResponse<T> {
    totalItems: number;
    pageNumber: number;
    nextPage: number | null;
    previousPage: number | null;
    totalPages: number;
    items: T[];
}