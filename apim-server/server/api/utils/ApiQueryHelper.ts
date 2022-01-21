
import { ParsedQs } from 'qs';
import APSSortDirection = Components.Parameters.SortDirection;


export type TApiPagingInfo = {
  pageNumber: Components.Parameters.PageNumber;
  pageSize: Components.Parameters.PageSize;
}

export type TApiSortInfo = {
  sortFieldName: Components.Parameters.SortFieldName;
  sortDirection: APSSortDirection;
}

export type TApiSearchInfo = {
  searchWordList?: Components.Parameters.SearchWordList;
  searchOrganizationId?: Components.Parameters.SearchOrganizationId;
  excludeSearchOrganizationId?: Components.Parameters.ExcludeSearchOrganizationId;
  searchIsActivated?: Components.Parameters.SearchIsActivated;
  searchUserId?: Components.Parameters.SearchUserId;
}

export class ApiQueryHelper {

  private static decodeQueryParam = (param: string): string => {
    return decodeURIComponent(param.replace(/\+/g, ' '));
  }

  public static getPagingInfoFromQuery = (query: ParsedQs): TApiPagingInfo => {
    return { 
      pageNumber: Number.parseInt(query.pageNumber as string) || 1,
      pageSize: parseInt(query.pageSize as string) || 20
    }
  }

  public static getSortInfoFromQuery = (query: ParsedQs): TApiSortInfo => {
    return { 
      sortFieldName: query.sortFieldName ? (query.sortFieldName as string) : '_id',
      sortDirection: query.sortDirection ? (query.sortDirection as APSSortDirection) : 'asc'
    }
  }

  public static getSearchInfoFromQuery = (query: ParsedQs): TApiSearchInfo => {
    return {
      searchWordList: query.searchWordList ? ApiQueryHelper.decodeQueryParam(query.searchWordList as string) : undefined,
      searchOrganizationId: query.searchOrganizationId ? (query.searchOrganizationId as string) : undefined,
      excludeSearchOrganizationId: query.excludeSearchOrganizationId ? (query.excludeSearchOrganizationId as string) : undefined,
      searchIsActivated: query.searchIsActivated ? (Boolean(JSON.parse(query.searchIsActivated as string))) : undefined,
      searchUserId: query.searchUserId ? (query.searchUserId as string) : undefined,
    }
  }

}