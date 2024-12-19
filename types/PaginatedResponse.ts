// types/PaginatedResponse.ts
export interface PaginatedResponse<T> {
    totalItems: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalPages: number;
    results: T[];
}