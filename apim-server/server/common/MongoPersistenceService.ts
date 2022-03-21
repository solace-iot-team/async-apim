
import { EServerStatusCodes, ServerLogger } from './ServerLogger';
import { MongoDatabaseAccess } from './MongoDatabaseAccess';
import mongodb, { DeleteResult, InsertOneOptions, UpdateOptions, UpdateResult, Document, ReplaceOptions, SortDirection, Filter } from 'mongodb';
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
  documentList: Array<any>,
  totalDocumentCount: number
}

export type TCreateSearchContentCallback = ((document:any) => string) | undefined;

export type TMongoCreateOptions = {
  organizationId?: string;
  collectionDocumentId: string;
  collectionDocument: any;
  collectionSchemaVersion: number;
}
export type TMongoUpdateOptions = {
  organizationId?: string;
  collectionDocumentId: string;
  collectionDocument: any;
  collectionSchemaVersion: number;
}
export type TMongoReplaceOptions = {
  organizationId?: string;
  collectionDocumentId: string;
  collectionDocument: any;
  collectionSchemaVersion: number;
}

export class MongoPersistenceService {
  private collectionName: string;
  private isTextSearchEnabled: boolean;
  private createSearchContentCallback: TCreateSearchContentCallback = undefined;
  private static searchContentFieldName = "_searchContent";
  private static organizationIdFieldName = "_organizationId";
  private static idFieldName = "_id";
  private static schemaVersionFieldName = "_schemaVersion";

  private getCollection = () => {
    return MongoDatabaseAccess.getDb().collection(this.collectionName);
  }

  private generateDocumentId = ({ documentId, organizationId }:{
    documentId: string;
    organizationId?: string;
  }) => {
    if(organizationId) return `${organizationId}_${documentId}`;
    else return documentId;
  }

  private generateDeepObjectValuesString = (source: any, result = ''): string => {
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
    const projection: any = {};
    projection[MongoPersistenceService.searchContentFieldName] = 0;
    projection[MongoPersistenceService.organizationIdFieldName] = 0;
    projection[MongoPersistenceService.idFieldName] = 0;
    projection[MongoPersistenceService.schemaVersionFieldName] = 0;
    return projection;
  }

  constructor(collectionName: string, isTextSearchEnabled = false, createSearchContentCallback?: TCreateSearchContentCallback) {
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

  public allRawLessThanTargetSchemaVersion = async(targetSchemaVersion: number): Promise<Array<any>> => {
    const funcName = 'allRawLessThanTargetSchemaVersion';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;

    const collection: mongodb.Collection = this.getCollection();

    // only added schemaVersion from 1 onwards
    // NOTE: cannot make $or filter work, so search twice.
    const undefinedFilter: Filter<any> = {};
    // undefinedFilter[MongoPersistenceService.schemaVersionFieldName] = { $exists: false };
    undefinedFilter[MongoPersistenceService.schemaVersionFieldName] = undefined;
    const ltFilter: Filter<any> = {};
    ltFilter[MongoPersistenceService.schemaVersionFieldName] = { $lt: targetSchemaVersion };
    const undefinedDocumentList: Array<Document> = await collection.find(undefinedFilter).toArray();
    const ltDocumentList: Array<Document> = await collection.find(ltFilter).toArray();
    const documentList: Array<Document> = undefinedDocumentList.concat(ltDocumentList);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'documentList for schemaVersion', details: { 
      undefinedFilter: undefinedFilter,
      ltFilter: ltFilter,
      documentList: documentList 
    }}));
    return documentList;
  }
  
  public allByOrganizationIdRaw = async(organizationId: string): Promise<any> => {
    // const funcName = 'allByOrganizationIdRaw';
    // const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const collection: mongodb.Collection = this.getCollection();
    const filter: Filter<any> = {};
    filter[MongoPersistenceService.organizationIdFieldName] = organizationId;
    const findCursor: mongodb.FindCursor = collection.find(filter);
    const documentList: Array<Document> = await findCursor.toArray();
    return documentList;
  }

  public byIdRaw = async({ documentId, organizationId }:{
    documentId: string;
    organizationId?: string;
  }): Promise<any> => {
    const funcName = 'byIdRaw';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const collection: mongodb.Collection = this.getCollection();

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: documentId,
      organizationId: organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));


    // const foundDocument = await collection.findOne({ _id: documentId });
    const foundDocument = await collection.findOne({ _id: generatedCollectionDocumentId });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'foundDocument', details: foundDocument }));
    if(!foundDocument) throw new ApiKeyNotFoundServerError(logName, undefined, { id: documentId, collectionName: collection.collectionName });
    return foundDocument;
  }

  public all = async({ organizationId, pagingInfo, sortInfo, searchInfo }: {
    pagingInfo?: TMongoPagingInfo;
    sortInfo?: TMongoSortInfo;
    searchInfo?: TMongoSearchInfo;
    organizationId?: string;
  }): Promise<TMongoAllReturn> => {
    const funcName = 'all';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, details: {
      collectionName: this.collectionName,
      organizationId: organizationId,
      pagingInfo: pagingInfo,
      sortInfo: sortInfo,
      searchInfo: searchInfo
     }}));

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
    if(organizationId) {
      filter[MongoPersistenceService.organizationIdFieldName] = organizationId;
    }
    if(searchInfo) {
      if(searchInfo.searchWordList) {
        // NOTE: cannot make this text search work
        // Behaviour:
        // in: string with search words, separated by <space>
        // - searches in searchContentField for all occurrences of search words (contains)
        // - ORs all search words
        // 
        // filter['$text'] = {
        //   // logical OR of search terms
        //   // $search: `\"${searchInfo.searchPhrase}\"`
        //   $search: `${searchInfo.searchWordList}`,
        //   // $search: new RegExp('.*' + searchInfo.searchWordList + '.*')
        //   $caseSensitive: false 
        // },
        const searchWordArray: Array<string> = searchInfo.searchWordList.split(' ');
        const regExStrList: Array<string> = [];
        for(const searchWord of searchWordArray) {
          if(searchWord !== '') regExStrList.push(`.*${searchWord}.*`);
        }
        const regExStr: string = regExStrList.join('|');
        // ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, message: 'regExStr', details: regExStr}));
        filter[MongoPersistenceService.searchContentFieldName] = new RegExp(regExStr, 'gi');        
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

    let findCursor: mongodb.FindCursor;

    if(pagingInfo) {
      findCursor
      = collection
        .find(filter)
        .sort(_sortInfo)
        .skip( (pagingInfo.pageNumber -1) * pagingInfo.pageSize)
        .limit(pagingInfo.pageSize)
        .project(this.getReturnProjection())
    } else {
      findCursor
      = collection
        .find(filter)
        .sort(_sortInfo)
        .project(this.getReturnProjection());
    }

    const documentList: Array<Document> = await findCursor.toArray();

    const returnObject: TMongoAllReturn = {
      documentList: documentList,
      totalDocumentCount: totalDocumentCount
    }
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, details: {
      collectionName: this.collectionName,
      returnObject: returnObject
    }}));
    return returnObject;
  }

  public byId = async({ organizationId, documentId }: {
    documentId: string;
    organizationId?: string;
  }): Promise<any> => {
    const funcName = 'byId';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const collection: mongodb.Collection = this.getCollection();

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: documentId,
      organizationId: organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));


    const filter: Filter<any> = {};
    // if(organizationId) {
    //   filter[MongoPersistenceService.organizationIdFieldName] = organizationId;
    // }
    // filter[MongoPersistenceService.idFieldName] = collectionDocumentId;
    filter[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVING, details: {
      collectionName: this.collectionName,
      filter: filter
    }}));

    const foundDocument = await collection.findOne(filter, { projection: this.getReturnProjection() });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.RETRIEVED, details: {
      collectionName: this.collectionName,
      document: foundDocument
    }}));

    if(!foundDocument) throw new ApiKeyNotFoundServerError(logName, undefined, { id: generatedCollectionDocumentId, collectionName: collection.collectionName });

    return foundDocument;
  }
   
  public create = async(options: TMongoCreateOptions): Promise<any> => {
    const funcName = 'create';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const opts: InsertOneOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true }
    }
    const collection: mongodb.Collection = this.getCollection();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, details: {
      collectionName: this.collectionName,
      options: options
    }}));

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: options.collectionDocumentId,
      organizationId: options.organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));

    // find by combined key: orgId + collectionDocumentId
    const filter: Filter<any> = {};
    // if(options.organizationId) {
    //   filter[MongoPersistenceService.organizationIdFieldName] = options.organizationId;
    // }
    // filter[MongoPersistenceService.idFieldName] = options.collectionDocumentId;
    filter[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;
    // const existingDocument = await collection.findOne(filter, { projection: { _id: 1 } });
    const existingDocument = await collection.findOne(filter);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, details: {
      collectionName: this.collectionName,
      existingDocument: existingDocument ? existingDocument : { exists: false }
    }}));
    
    if(existingDocument) {
      throw new ApiDuplicateKeyServerError(logName, undefined, { organizationId: options.organizationId, id: options.collectionDocumentId, collectionName: collection.collectionName});
    }

    if(this.isTextSearchEnabled) options.collectionDocument[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(options.collectionDocument);
    if(options.organizationId) options.collectionDocument[MongoPersistenceService.organizationIdFieldName] = options.organizationId;
    // options.collectionDocument[MongoPersistenceService.idFieldName] = options.collectionDocumentId;
    options.collectionDocument[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;
    options.collectionDocument[MongoPersistenceService.schemaVersionFieldName] = options.collectionSchemaVersion;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATING, details: {
      collectionName: this.collectionName,
      insertingDocument: options.collectionDocument
    }}));

    await collection.insertOne(options.collectionDocument, opts);
    // const insertedDocument = await collection.findOne({ _id: options.collectionDocumentId }, { projection: this.getReturnProjection() });
    const insertedDocument = await collection.findOne({ _id: generatedCollectionDocumentId }, { projection: this.getReturnProjection() });
    if(!insertedDocument) throw new ApiInternalServerError(logName, 'insertedDocument is undefined');

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.CREATED, details: {
      collectionName: this.collectionName,
      insertedDocument: insertedDocument
    }}));
    
    return insertedDocument;
  }

  private updateMergeCustomizer = (originalValue: any, updateValue: any): any => {
    // replace arrays
    if(_.isArray(originalValue)) return updateValue;
    else return undefined;
    // // update arrays
    // if(_.isArray(originalValue)) return originalValue.concat(updateValue);
    // else return undefined;
  }

  public update = async(options: TMongoUpdateOptions): Promise<any> => {
    const funcName = 'update';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const opts: UpdateOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true }
    }  
    const collection: mongodb.Collection = this.getCollection();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      collectionName: this.collectionName,
      options: options
    }}));

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: options.collectionDocumentId,
      organizationId: options.organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));

    // find by combined key: orgId + collectionDocumentId
    const filter: Filter<any> = {};
    // if(options.organizationId) {
    //   filter[MongoPersistenceService.organizationIdFieldName] = options.organizationId;
    // }
    // filter[MongoPersistenceService.idFieldName] = options.collectionDocumentId;
    filter[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      collectionName: this.collectionName,
      findExistingDocumentFilter: filter
    }}));

    const existingDocument = await collection.findOne(filter, { projection: { _id: 0 } });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      collectionName: this.collectionName,
      existingDocument: existingDocument
    }}));

    if(!existingDocument) {
      throw new ApiKeyNotFoundServerError(logName, undefined, { organizationId: options.organizationId, id: options.collectionDocumentId, collectionName: collection.collectionName});
    }

    options.collectionDocument[MongoPersistenceService.schemaVersionFieldName] = options.collectionSchemaVersion;
    
    const mergedDocument = _.mergeWith(existingDocument, options.collectionDocument, this.updateMergeCustomizer);
    if(this.isTextSearchEnabled) mergedDocument[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(options.collectionDocument);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      collectionName: this.collectionName,
      updateDocument: mergedDocument
    }}));
    
    // const updateResult: UpdateResult | Document = await collection.updateOne({ _id: options.collectionDocumentId }, { $set: mergedDocument } , opts);
    const updateResult: UpdateResult | Document = await collection.updateOne({ _id: generatedCollectionDocumentId }, { $set: mergedDocument } , opts);

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      updateResult: updateResult
    }}));

    // const updatedDocument = await collection.findOne({ _id: options.collectionDocumentId }, { projection: this.getReturnProjection() });
    const updatedDocument = await collection.findOne({ _id: generatedCollectionDocumentId }, { projection: this.getReturnProjection() });
    if(!updatedDocument) throw new ApiInternalServerError(logName, 'updatedDocument is undefined');
    
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATED, details: {
      collectionName: this.collectionName,
      updatedDocument: updatedDocument
    }}));

    return updatedDocument;
  }

  public replace = async(options: TMongoReplaceOptions): Promise<any> => {
    const funcName = 'replace';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;

    const opts: ReplaceOptions = {
      fullResponse: true,
      writeConcern: { w: 1, j: true },
      upsert: false
    }  
    const collection: mongodb.Collection = this.getCollection();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, details: {
      collectionName: this.collectionName,
      options: options
    }}));

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: options.collectionDocumentId,
      organizationId: options.organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));

    // find by combined key: orgId + collectionDocumentId
    const filter: Filter<any> = {};
    // if(options.organizationId) {
    //   filter[MongoPersistenceService.organizationIdFieldName] = options.organizationId;
    // }
    // filter[MongoPersistenceService.idFieldName] = options.collectionDocumentId;
    filter[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, details: {
      collectionName: this.collectionName,
      findExistingDocumentFilter: filter
    }}));

    const existingDocument = await collection.findOne(filter, { projection: { _id: 0 } });

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, details: {
      collectionName: this.collectionName,
      existingDocument: existingDocument
    }}));

    if(!existingDocument) {
      throw new ApiKeyNotFoundServerError(logName, undefined, { organizationId: options.organizationId, id: options.collectionDocumentId, collectionName: collection.collectionName});
    }

    if(this.isTextSearchEnabled) options.collectionDocument[MongoPersistenceService.searchContentFieldName] = this.createSearchContent(options.collectionDocument);
    options.collectionDocument[MongoPersistenceService.schemaVersionFieldName] = options.collectionSchemaVersion;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, details: {
      collectionName: this.collectionName,
      replaceDocument: options.collectionDocument
    }}));

    // const replaceResult: UpdateResult | Document = await collection.replaceOne({ _id: options.collectionDocumentId }, options.collectionDocument, opts);    
    const replaceResult: UpdateResult | Document = await collection.replaceOne({ _id: generatedCollectionDocumentId }, options.collectionDocument, opts);    

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.UPDATING, details: {
      replaceResult: replaceResult
    }}));

    // const replacedDocument = await collection.findOne({ _id: options.collectionDocumentId }, { projection: this.getReturnProjection() });
    const replacedDocument = await collection.findOne({ _id: generatedCollectionDocumentId }, { projection: this.getReturnProjection() });
    if(!replacedDocument) throw new ApiInternalServerError(logName, 'replacedDocument is undefined');

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.REPLACING, details: {
      collectionName: this.collectionName,
      replacedDocument: replacedDocument
    }}));

    return replacedDocument;
  }

  public delete = async({ organizationId, documentId }: {
    organizationId?: string;
    documentId: string;
  }): Promise<Record<string, unknown>> => {
    const funcName = 'delete';
    const logName = `${MongoPersistenceService.name}.${funcName}()`;
    const collection: mongodb.Collection = this.getCollection();

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, details: {
      collectionName: this.collectionName,
      organizationId: organizationId,
      collectionDocumentId: documentId
    }}));

    // generate combined key 
    // FUTURE: each org has its own DB
    const generatedCollectionDocumentId = this.generateDocumentId({
      documentId: documentId,
      organizationId: organizationId
    });
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.INFO, details: {
      generatedCollectionDocumentId: generatedCollectionDocumentId
    }}));

    const deletedDocument = await this.byId({
      organizationId: organizationId,
      documentId: documentId
    });

    const filter: Filter<any> = {};
    // if(organizationId) {
    //   filter[MongoPersistenceService.organizationIdFieldName] = organizationId;
    // }
    // filter[MongoPersistenceService.idFieldName] = collectionDocumentId;
    filter[MongoPersistenceService.idFieldName] = generatedCollectionDocumentId;

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, details: {
      collectionName: this.collectionName,
      filter: filter,
    }}));

    const deleteResult: DeleteResult = await collection.deleteOne(filter);
    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETING, details: {
      deleteResult: deleteResult 
    }}));

    let deletedCount = 0;
    if (deleteResult.acknowledged) deletedCount = deleteResult.deletedCount;
    if (deletedCount === 0) throw new ApiKeyNotFoundServerError(logName, undefined, { organizationId: organizationId, id: documentId, collectionName: collection.collectionName});

    ServerLogger.trace(ServerLogger.createLogEntry(logName, { code: EServerStatusCodes.DELETED, details: {
      deletedDocument: deletedDocument
    }}));

    return deletedDocument;
  }

}
