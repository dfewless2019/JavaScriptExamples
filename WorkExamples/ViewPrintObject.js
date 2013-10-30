var VIEW_PRINT_OBJECT = function(){ 
    var formID,
        formRecord,
        formModule,
        FormObject,
        displayFields,
        submissions,
        dataCollectedFuncs = [],
        openYears;
    // stops progress if there is an error 
    var stopProgress = function(){
        dataCollectedFuncs = [];
    };     
    // return the submissions that are valid to the form 
    var getSubmissions = function(){
        return submissions;
    };
    // collects the data 
    var collectData = function(FilterByOpenyears){
        var baseQuery,
            query,
            otyWhere;
        // buuilding the querry if filters are needed     
        if ( openYears && openYears.oty.length > 0  && FilterByOpenyears !==undefined && !FormObject.usesMetaData() ) {
              for (var i = 0; i < openYears.oty.length; i++){
                  baseQuery = "<Eq><FieldRef Name='Fiscal_x0020_Year' LookupId='True' /><Value Type='Lookup'>" + openYears.oty[i].ID + "</Value></Eq>";
                  if (!otyWhere) otyWhere = baseQuery;
                  else otyWhere = "<Or>" + otyWhere + baseQuery + "</Or>";
           }
        }else{
            otyWhere = undefined;
        }  
        
        DataPool[ formRecord.DataPoolSubmission ].getFromServer({  
            where : otyWhere,
            async: function(results){
                
                if(results.items.length > 0){
                    submissions = results.items;
                    
                    DataPool[ formRecord.DataPoolApprovalNa ].getFromServer({
                        async: function(results){
                            
                            for( var i = 0; i < submissions.length; i++ ){
                                    baseQuery = "<Eq><FieldRef Name='ID' /><Value Type='ID'>" + submissions[i].User.split(";#")[0] + " </Value></Eq>";
                                    if(!query) query = baseQuery;
                                    else query = "<Or>"+ query + baseQuery + "</Or>";
                            }
                            
                            DataPool.users.getFromServer({
                                where:query,
                                async:function(results){ 
                                    // uses meta data ?  
                                    query=undefined;
                                    if( FormObject.usesMetaData() ){
                                        for( var i = 0; i < submissions.length; i++ ){
                                            baseQuery = "<Eq><FieldRef Name='ID' /><Value Type='ID'>" + submissions[i].EmployeeMetaData.split(";#")[0] + " </Value></Eq>";
                                            if(!query) query = baseQuery;
                                            else query = "<Or>"+ query + baseQuery + "</Or>";
                                        }
                                        otyWhere = undefined;
                                        if ( openYears && openYears.oty.length > 0  && FilterByOpenyears !==undefined  ) {

                                            for (var i = 0; i < openYears.oty.length; i++){
                                                baseQuery = "<Eq><FieldRef Name='Quota_x0020_Fiscal_x0020_Year' LookupId='True' /><Value Type='Lookup'>" + openYears.oty[i].ID + "</Value></Eq>";
                                                if (!otyWhere) otyWhere = baseQuery;
                                                else otyWhere = "<Or>" + otyWhere + baseQuery + "</Or>";
                                            }
                                        }
                                        if ( query && otyWhere && FilterByOpenyears !== undefined  ){
                                            query = "<And>" + query + otyWhere + "</And>";
                                        }else if (query && !otyWhere && FilterByOpenyears === undefined ){
                                            // really just do nothing cause query is defined 
                                        } else if (otyWhere && FilterByOpenyears !== undefined   ){
                                            query = otyWhere;
                                        }
                                        if(!query){
                                            return;
                                        }

                                        DataPool[ formRecord.DataPoolMetaName ].getFromServer({
                                            where: query,
                                            async: function(results){

                                                if( results.items.length > 0 ){
                                                    query = undefined;

                                                    for( var i = 0; i < results.items.length; i++ ){
                                                        baseQuery = "<Eq><FieldRef Name='ID' /><Value Type='ID'>" + results.items[i].Employee.split(";#")[0] + " </Value></Eq>";
                                                        if(!query) query = baseQuery;
                                                        else query = "<Or>"+ query + baseQuery + "</Or>";
                                                    }

                                                    DataPool.employees.getFromServer({
                                                        where: query,
                                                        async: function(results){ 
                                                            callDataCollectedFuncs();
                                                        }
                                                    });

                                                }else{
                                                   callDataCollectedFuncs();
                                                }
                                            }
                                        });

                                    }else{// does not use meta data. 
                                        callDataCollectedFuncs();
                                    }                                    
                                }
                            });

                        }
                    });
                    
                }else{
                    callDataCollectedFuncs();
                }
           }
       }); 
    };
    // gets all the display fields when needed 
    var getDiplayFields = function(){
        return displayFields;
    };
    // returns you this form
    var getFormObject = function(){
        return FormObject;
    };
    // used to call function after the data is all pulled 
    var onDataCollected = function( func ){
        dataCollectedFuncs.push( func );
    };
    // calls the function pusshed into onDataCollected 
    var callDataCollectedFuncs = function(){
        for (var i = 0; i < dataCollectedFuncs.length; i++){
            dataCollectedFuncs[i]();
        }
    };
    // main function figuring out what form to use and if filters need to be added. 
    var registerForm = function( frmId, FilterByOpenyears ){
        if(FilterByOpenyears){
             openYears = FISCIALYEAR.getFiscalYears();  
        }
        if( frmId === ""){
            return;
        }
        
        formID = frmId;
        
        formRecord = Form().getFormRecord( formID );
        formModule = formRecord.Module;
        FormObject = Form().getFormObject( formModule );
        
        if(FormObject.registerFields){
            FormObject.registerFields();
        }
        
        if( FormObject ){
            displayFields =  FormObject.getAggregatedFields();
            collectData((FilterByOpenyears!==undefined ? FilterByOpenyears : undefined ));
        }
    };
    
    return{
        getSubmissions:getSubmissions,
        registerForm:registerForm,
        onDataCollected: onDataCollected,
        getDiplayFields:getDiplayFields,
        getFormObject:getFormObject,
        stopProgress:stopProgress
    };
}();