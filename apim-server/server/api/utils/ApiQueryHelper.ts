
import { ParsedQs } from 'qs';
import APSSortDirection = Components.Parameters.SortDirection;


export type TApiPagingInfo = {
  pageNumber: number,
  pageSize: number
}

export type TApiSortInfo = {
  sortFieldName: string,
  sortDirection: APSSortDirection
}

export type TApiSearchInfo = {
  searchWordList?: string
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
      searchWordList: query.searchWordList ? ApiQueryHelper.decodeQueryParam(query.searchWordList as string) : undefined
    }
  }

}