
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import { MongoDatabaseAccess } from './MongoDatabaseAccess';
import mongodb, { DeleteResult, InsertOneOptions, InsertOneResult, UpdateOptions, UpdateResult, Document, ReplaceOptions, SortDirection, Filter } from 'mongodb';
import { ApiBadSortFieldNameServerError, ApiDuplicateKeyServerError, ApiInternalServerError, ApiKeyNotFoundServerError } from './ServerError';
import _ from 'lodash';

export type TMongoSearchInfo = {
  searchWordList?: string,
  filter?: any
}

export type TMongoSortInfo = {
  sortFieldName: string,
  sortDirection: SortDirection,
  apsObjectSortFieldNameValidationSchema: any,
  apsObjectName: string
}
export type TMongoPagingInfo = {
  pageNumber: number,
  pageSize: number
}
export type TMongoAllReturn = {
  documentList: Array<object>,
  totalDocumentCount: number
}

export type TCreateSearchContentCallback = ((document:any) => string) | undefined;

export class MongoPersistenceService {
  private collectionName: string;
  private isTextSearchEnabled: boolean;
  private createSearchContentCallback: TCreateSearchContentCallback = undefined;
  private static searchContentFieldName: string = "_searchContent";

  private getCollection = () => {
    return MongoDatabaseAccess.getDb().collection(this.collectionName);
  }

  private generateDeepObjectValuesString = (source: any, result: string = ''): string => {
    const isObject = (obj:any ) => obj && typeof obj === 'object';

    Object.keys(source).forEach( key => {
      const value = source[key];
      if (Array.isArray(value)) result += this.generateDeepObjectValuesString(value);
      else if (isObject(value)) result += this.generateDeepObjectValuesString(value);
      else result += value + ',';
    });

    return result;
  }

  private createSearchContent = (document: any): string => {
    if(this.createSearchContentCallback) return this.createSearchContentCallback(document);
    else return this.generateDeepObjectValuesString(document);
  }

  private getReturnProjection = (): any => {
    let projection: any = {
      _id: 0
    };
    projection[MongoPersistenceService.searchContentFieldName] = 0;
    return projection;
  }

  constructor(collectionName: string, isTextSearchEnabled: boolean = false, createSearchContentCallback?: TCreateSearchContentCallback) {
    this.collectionName = collectionName;
    this.isTextSearchEnabled = isTextSearchEnabled;
    if(createSearchContentCallback) this.createSearchContentCallback = createSearchContentCallback;
  }

  public initialize = async() => {
    const funcName = 'initialize';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZING, details: { collection: this.collectionName } } ));
    if(this.isTextSearchEnabled) {
      const collection: mongodb.Collection = this.getCollection();
      const indexSpec: any = {};
      indexSpec[MongoPersistenceService.searchContentFieldName] = "text";
      await collection.createIndex( indexSpec );
      ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'created index', details: { collection: this.collectionName } } ));
    }
    ServerLogger.info(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INITIALIZED, details: { collection: this.collectionName } } ));
  }

  public dropCollection = async() => {
    const collection: mongodb.Collection = this.getCollection();
    await collection.drop();
  }

  public all = async(pagingInfo?: TMongoPagingInfo, sortInfo?: TMongoSortInfo, searchInfo?: TMongoSearchInfo): Promise<TMongoAllReturn> => {
    const funcName = 'all';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;

    if(sortInfo) {
      const dbObjectSortFieldNameValidationSchema: any & { _id: string } = {
        ...sortInfo.apsObjectSortFieldNameValidationSchema,
        _id: 'string'
      };
      if(!_.has(dbObjectSortFieldNameValidationSchema, sortInfo.sortFieldName)) throw new ApiBadSortFieldNameServerError(logName, undefined , { sortFieldName: sortInfo.sortFieldName, apsObjectName: sortInfo.apsObjectName });
    }

    // force MongoError
    // DatabaseAccess.disconnect();

    let _sortInfo: any = {};
    if(sortInfo) _sortInfo[sortInfo.sortFieldName] = sortInfo.sortDirection
    else _sortInfo = { _id: 1 };

    let filter: Filter<any> = {};
    if(searchInfo) {
      if(searchInfo.searchWordList) {
        filter['$text'] = {
          // $search: `\"${searchInfo.searchPhrase}\"`
          $search: `${searchInfo.searchWordList}`
        }
      }
      if(searchInfo.filter) {
        filter = {
          ...filter,
          ...searchInfo.filter
        }
      }
    }

    const collection: mongodb.Collection = this.getCollection();
    const totalDocumentCount: number = await collection.countDocuments(filter);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'totalDocumentCount', details: totalDocumentCount}));

    let findCursor: mongodb.FindCursor;

    if(pagingInfo) {
      findCursor
      = collection
        .find(filter)
        .sort(_sortInfo)
        .skip( (pagingInfo.pageNumber -1) * pagingInfo.pageSize)
        .limit(pagingInfo.pageSize)
        .project(this.getReturnProjection());
    } else {
      findCursor
      = collection
        .find(filter)
        .sort(_sortInfo)
        .project(this.getReturnProjection());
    }

    const documentList: Array<Document> = await findCursor.toArray();
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'documentList', details: documentList }));
    return {
      documentList: documentList,
      totalDocumentCount: totalDocumentCount
    }
  }

  public byId = async(documentId: string): Promise<object> => {
    const funcName = 'byId';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const collection: mongodb.Collection = this.getCollection();
    const foundDocument = await collection.findOne({ _id: documentId }, { projection: this.getReturnProjection() });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'foundDocument', details: foundDocument }));
    if(!foundDocument) throw new ApiKeyNotFoundServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName });
    return foundDocument;
  }
   
  public create = async(documentId: string, document: any): Promise<object> => {
    const funcName = 'create';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const opts: InsertOneOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true }
    }
    const collection: mongodb.Collection = this.getCollection();
    const existingDocument = await collection.findOne({ _id: documentId }, { projection: { _id: 1 } });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'existingDocument', details: existingDocument ? existingDocument : { exists: false }}));
    if(existingDocument) throw new ApiDuplicateKeyServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName});
    if(this.isTextSearchEnabled) document[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(document);
    document._id = documentId;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'inserting document', details: document }));
    const result: InsertOneResult = await collection.insertOne(document, opts);
    const insertedDocument = await collection.findOne({ _id: documentId }, { projection: this.getReturnProjection() });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'insertedDocument', details: insertedDocument }));
    if(!insertedDocument) throw new ApiInternalServerError(logName, 'insertedDocument is undefined');
    return insertedDocument;
  }

  private updateMergeCustomizer = (originalValue: any, updateValue: any): any => {
    if(_.isArray(originalValue)) return originalValue.concat(updateValue);
    else return undefined;
  }

  public update = async(documentId: string, document: any): Promise<object> => {
    const funcName = 'update';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const opts: UpdateOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true }
    }  
    const collection: mongodb.Collection = this.getCollection();
    const existingDocument = await collection.findOne({ _id: documentId }, { projection: { _id: 0 } });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'existingDocument', details: existingDocument }));
    if(!existingDocument) throw new ApiKeyNotFoundServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName});
    const mergedDocument = _.mergeWith(existingDocument, document, this.updateMergeCustomizer);
    if(this.isTextSearchEnabled) mergedDocument[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(document);
    const result: UpdateResult | Document = await collection.updateOne({ _id: documentId }, { $set: mergedDocument } , opts);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'result', details: result }));
    const updatedDocument = await collection.findOne({ _id: documentId }, { projection: this.getReturnProjection() });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'updatedDocument', details: updatedDocument }));
    if(!updatedDocument) throw new ApiInternalServerError(logName, 'updatedDocument is undefined');
    return updatedDocument;
  }

  public replace = async(documentId: string, document: any): Promise<object> => {
    const funcName = 'replace';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const opts: ReplaceOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true },
      upsert: false
    }  
    const collection: mongodb.Collection = this.getCollection();
    const existingDocument = await collection.findOne({ _id: documentId }, { projection: { _id: 0 } });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'existingDocument', details: existingDocument }));
    if(!existingDocument) throw new ApiKeyNotFoundServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName});
    if(this.isTextSearchEnabled) document[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(document);
    document._id = documentId;
    const result: UpdateResult | Document = await collection.replaceOne({ _id: documentId }, document, opts);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'result', details: result }));
    const replacedDocument = await collection.findOne({ _id: documentId }, { projection: this.getReturnProjection() });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'replacedDocument', details: replacedDocument }));
    if(!replacedDocument) throw new ApiInternalServerError(logName, 'replacedDocument is undefined');
    return replacedDocument;
  }

  public delete = async(documentId: string): Promise<number> => {
    const funcName = 'delete';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'documentId', details: documentId }));
    const collection: mongodb.Collection = this.getCollection();
    const deleteResult: DeleteResult = await collection.deleteOne({ _id: documentId });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'deleteResult', details: deleteResult }));
    let deletedCount: number = 0;
    if (deleteResult.acknowledged) deletedCount = deleteResult.deletedCount;
    if (deletedCount === 0) throw new ApiKeyNotFoundServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName });
    return deletedCount;
  }

 
  // validateReferences(names: string[]): Promise<boolean> {
  //   return new Promise<boolean>((resolve, reject) => {
  //     var results: Promise<boolean>[] = [];
  //     names.forEach((n) => {
  //       results.push(new Promise<boolean>((resolve, reject) => {
  //         this.byName(n).then((p) => {
  //           resolve(true);
  //         }
  //         ).catch((e) => {
  //           reject(new ErrorResponseInternal(422, `Referenced name ${n} does not exist`));
  //         })
  //       }));
  //     });
  //     Promise.all(results).then((r) => { resolve(true) }).catch((e) => {
  //       L.info(e);
  //       (new ErrorResponseInternal(422, e));
  //     });

  //   }

  //   );
  // }

}
