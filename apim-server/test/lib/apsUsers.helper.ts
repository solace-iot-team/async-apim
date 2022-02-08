import { APSUserResponseList, ApsUsersService, ListApsUsersResponse } from "../../src/@solace-iot-team/apim-server-openapi-node";


export class ApsUsersHelper {

  public static deleteAllUsers = async(): Promise<APSUserResponseList> => {
    let apsUserList: APSUserResponseList = [];
    const pageSize = 100;
    let pageNumber = 1;
    let hasNextPage = true;
    while (hasNextPage) {
      const resultListApsUsers: ListApsUsersResponse  = await ApsUsersService.listApsUsers({
        pageSize: pageSize, 
        pageNumber: pageNumber
      });
      if(resultListApsUsers.list.length === 0 || resultListApsUsers.list.length < pageSize) hasNextPage = false;
      pageNumber++;
      apsUserList.push(...resultListApsUsers.list);
    }
    for (const apsUser of apsUserList) {
      await ApsUsersService.deleteApsUser({
        userId: apsUser.userId
      });
    }
    return apsUserList;
  }


}