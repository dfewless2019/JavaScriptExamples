var NAVIGATION = (function(){
    var init = function(){
        var page = window.location.href.toString().toLowerCase(),  
            remove = //url removed,
            CurrentPageRecord, 
            html = "",
            subnavGroups;
      
        if (page.indexOf(/*URL reomved*/) <= -1) return;
        
        page = GLOBAL.Clean(page, "?", 0); 
        page = page.substring(remove.length);
        //Data Retrival 
        DataPool.siteareas.getFromServer({ 
            async: function( results ){
                var siteAreas = results.items;
                //Qunit testing only shows up in testing mode 
                M1SP.test({
                    name: "Navigation.init",
                    desc: "Check to see if Site Areas are collected.",
                    func: function(){
                        if (!results.success ||
                            results.items.length <= 0){
                            
                            return false;
                        } else {
                            return true;
                        }
                    }
                });
                 //Data Retrival built in to proprietary library 
                DataPool.pages.getFromServer({
                    async: function ( results ){
                        //Qunit testing only shows up in testing mode 
                        M1SP.test({
                            name: "Navigation.init",
                            desc: "Check to see if Pages are collected.",
                            func: function(){
                                if (!results.success ||
                                    results.items.length <= 0){
                                    
                                    return false;
                                } else {
                                    return true;
                                }
                            }
                        });
                        // loops through data to find current page record based on the URL
                        for(var i = 0; i < siteAreas.length; i++){
                            if( siteAreas[i].page !== undefined &&
                                siteAreas[i].page.FileRef !== undefined &&
                                siteAreas[i].page.FileRef.split(";#")[1].toString().toLowerCase() === page){
                                
                                CurrentPageRecord = siteAreas[i];
                                // proper break 
                                i = siteAreas.length;
                            }
                        }
                        // if current page has a record in the data base build out the navigaiton in the records
                        if(CurrentPageRecord !== undefined && CurrentPageRecord.children){
                            
                            CurrentPageRecord.children.sort(function(a,b){
                                var aOrder,
                                    bOrder;
                                
                                if (a.order0 === undefined && b.order0 === undefined) return 0; 
                                else if (a.order0 === undefined) return 1;
                                else if (b.order0 === undefined) return -1;
                                
                                aOrder = parseInt(a.order0, 10);
                                bOrder = parseInt(b.order0, 10);
                                
                                if(aOrder > bOrder) return 1;
                                else if(aOrder < bOrder) return -1;
                                
                                return 0;
                            });
                            
                            
                            for(var i = 0; i < CurrentPageRecord.children.length; i++){
                                if(CurrentPageRecord.children[i].Hide!=="1"){
                                    // get the HTML from the SiteAreaObject. 
                                    html += CurrentPageRecord.children[i].getHtml();
                                }
                            }
                            //add nav html to page
                            if (html) $("#MenuDisplayContainer").html(html);  
                            // remove loading
                            $.unblockUI(); 
                            
                        }
                    }
                });
            }
        });
    };//end init
	
    // Handles the click event by finding the correct object and calling the function for the click 
    function getOnclick(id){
        var siteArea = DataPool.siteareas.array[id]; 
        //Qunit testing only shows up in testing mode 
        M1SP.test({
            name: "Navigation.getOnclick",
            desc: "Check if Site Area is found.",
            func: function(){
                if (!siteArea || !siteArea.OnclickLocationOverRide) return false;
                else return true;
            }
        });
        
        if(siteArea !== undefined && siteArea.OnclickLocationOverRide !== undefined){ 
            siteArea.OnclickLocationOverRide();
        }
    }
    // users that do not have access can click on the nav item and an email will be sent to admin requesting access for the user
    function RequestAssess(id){
        var siteArea = DataPool.siteareas.array[id];
       //Qunit testing only shows up in testing mode  
        M1SP.test({
            name: "Navigation.getOnclick",
            desc: "Check if Site Area is found.",
            func: function(){
                if (!siteArea || !siteArea.requestAccess) return false;
                else return true;
            }
        });
        
        if(siteArea !== undefined && siteArea.requestAccess !== undefined){ 
            siteArea.requestAccess();
        }
    }
    
    $(function(){
        init();  
    });
    
    return{
        getOnclick:getOnclick,
        RequestAssess:RequestAssess 
    };
})();