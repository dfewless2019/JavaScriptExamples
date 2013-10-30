var SiteArea = function(record){
    var thisObj = this;
    
    // checks if this object is available for all users regardless of security  
    this.isGlobal = function(){
        return (thisObj.Global === 1 || thisObj.Global === "1");
    };
    // returns the html depending on what the user can see based on security 
    this.getHtml = function(){
        var user = USER_INFO.getRecord();
        var html = "",
        	action = "",
        	disabledClass = "",
        	area = thisObj.pages === "" ? thisObj.Title.replace(/\s/g, '') : thisObj.pages.split(";#")[1], 
            subClassHtml,
            useSubclass = false,
            extUrlAction = "";
            
            if (thisObj.getIsValid()){  
         	if (thisObj.hasOwnProperty("externalUrl")) { extUrlAction = "window.open(\"" + thisObj.externalUrl + "\", \"_blank\")" ; }

			if (extUrlAction !== ""){
                action = "onclick='" + extUrlAction + ";'"; 
                //action = "href='" + extUrl + "' target='_blank'"; 
                disabledClass = "";
			} else if (thisObj.pages !== undefined && thisObj.pages !== ""){
                action = "onclick='NAVIGATION.getOnclick(" + thisObj.ID + ");'"; 
                disabledClass = "";
            } else {// sub menu
                //create sub menu container
                subClassHtml = "<div class='subNavContainer'>"; 
                if(thisObj.children !== undefined){
                    // loop through the children that are attatched and put them into the sub nav 
                    for( var submenu in thisObj.children){
                        if (thisObj.children[submenu].getIsValid()){  
                            var subarea = thisObj.children[submenu].pages === undefined ? thisObj.children[submenu].Title.replace(/\s/g, '') : thisObj.children[submenu].pages.split(";#")[1];
                            action = "onclick='NAVIGATION.getOnclick("+ thisObj.children[submenu].ID + ");'";
                            // needs css
                            subClassHtml += "<div class='subNavItem " + subarea + "' " + action + ">" + thisObj.children[submenu].Title + "</div>";
                            //display flag 
                            useSubclass = true;
                        }
                    }
                }
                subClassHtml+="</div>";
                // reset action for main image so no on click for the main menue. 
                action = "";
                disabledClass = "";
            }
        }else{
			action = "onclick='NAVIGATION.RequestAssess(" + thisObj.ID + ");'";
			disabledClass = " disabled";
        }
	if(thisObj.DontShowDisabled !== "1" || user.isAdmin()|| user.isRegionalAdmin()|| user.isSubAdmin()){ 
            if((user.isSubAdmin() || user.isRegionalAdmin()) && thisObj.onlyAdmin==="1"){
                // don't show to regional admin or to sub admin '
            }else{
            
                if (useSubclass === true){
                    area += " subNavParent"; 
                }
                html+="<div class='ImageMenuItem " + area + disabledClass + "'" + action + ">"
                    + 	"<div class='menuImg'></div>"
                    + 	"<div class='disabledImg'></div>"
                    +   "<div class='menuLabel'>"+ thisObj.Title + "</div>";
                if (useSubclass === true){
                    html += "<div class='dropArrow'></div>"
                    html += subClassHtml; 
                }
                html+="</div>";
            }
        }
        return html;
    };
    // ensures that the object is valid (containing the correct data) also checks security 
    this.getIsValid = function( user ){
        if ( thisObj.isGlobal() ) return true;
        
        if (!user) user = USER_INFO.getRecord();
        
        if(user.isAdmin())return true;
        var siteAreas = user.getSiteAreas(); 
        if(thisObj.isParent()){
            for (var i = 0; i < siteAreas.length; i++) {    
                if (siteAreas[i] === thisObj.ID){
                    return true;
                }
            }
        }else if(thisObj.parents.length>0){
          
            for(var p =0 ;p < thisObj.parents.length; p++ ){
                  if(thisObj.parents[p].pages===""){
                      for(var t = 0 ; t <thisObj.parents[p].parents.length;t++ ){
                         if(thisObj.parents[p].parents[t].ID === siteAreas[t]){ 
                            return true;
                        } 
                      }
                  }else{
                    for(var t =0 ; t < siteAreas.length; t++ ){
                        if(thisObj.parents[p].ID.split(";#")[0] === siteAreas[t]){ 
                            return true;
                        }
                    }
                  }
            }
        }
        return false;
    };
    // check the level to see if we are at the top level of navigation 
    this.isParent = function(){
      if(thisObj.children!==undefined && thisObj.children.length>0 && thisObj.pages!==""){ 
          return true;
      }  else{
          return false;
      }
    };
    // function for the clicking of the navigation
    this.OnclickLocationOverRide = function(obj){
        if(thisObj.getIsValid() && thisObj.page.FileRef !== undefined ){ 
            var fileRef = thisObj.page.FileRef.split(";#")[1];
            if(thisObj.Parameter!==undefined){
                fileRef=fileRef+"?"+thisObj.Parameter
            }
            if(fileRef.indexOf(/*URL reomved*/) === -1){
                window.location.href = /*URL reomved*/ + fileRef; 
            } else {
                window.location.href = "/" + fileRef;
            }
            
        } else {
            alert("You do not have access to this section of the site. Please click to request access."); 
        }
    };
    // object request access function sends email to admin for the user that requested the access 
    this.requestAccess = function(user){

        var requestSubmitted=false;
        if (!user){
            user = USER_INFO.getRecord(); 
        }
        if(thisObj.ID ===undefined && user===undefined){
            alert("There was an error processing your request. Please try again");
        } else{
            var userID =_spUserId;
            var opts = {where: "<Eq><FieldRef Name='Requestor' LookupId='True' /><Value Type='Lookup'>" + userID + "</Value></Eq>"};
            var Previousrecord = DataPool.accessrequest.getFromServer({
               where: opts  
            });
            if(Previousrecord!==undefined){
                for(var i =0 ; i < Previousrecord.items.length; i++){
                    if(Previousrecord.items[i].SiteArea.split(";#")[0]===thisObj.ID){
                        requestSubmitted=true;
                        break;
                    }
                }
            }
            if(!requestSubmitted){ 
                var region;
                if(user.isGuest()){
                    var x = screen.width/2 - 200/2;
                    var y = screen.height/2 - 200/2;
                    var regionWindow = window.open(/*URL reomved*/,"","width=200,height=200,left="+x+",top="+y+""), 
                    regions = DataPool.region.getFromServer({async:false}); 
                    setTimeout(function(){ 
                        var regionDocument = $(regionWindow.document),
                        savebutton = regionDocument.find("#saveBtn"),
                        selectDropdown = regionDocument.find("#regionSelector"),  
                        optionsAsString="<option value='N/A'>Select your Region</option>";
                        for(var i =0 ; i < regions.items.length; i++){ 
                            optionsAsString += "<option value='" + regions.items[i].ID + "'>" + regions.items[i].Title + "</option>"; 
                        }
                        selectDropdown.append(optionsAsString); 

                        $(savebutton).click(function(){
                            var val = regionDocument.find("#regionSelector option:selected").val();   
                            regionWindow.close();
                            if(val !==undefined && val !== "N/A" && val !== ""){
                              region = val; 
                              DataPool.accessrequest.add({
                                data : [["Requestor","SiteArea","Region"],[userID,thisObj.ID,region]],
                                async : function( results ){
                                    if(results.successCount===1){
                                        alert("Your request has been sent. Thank you."); 
                                        //email Admins of request
                                        var e = new EMAIL();
                                        e.sendApprovalnotice(); 
                                    }else{
                                       alert("There was an error processing your request. Please try again");
                                       
                                    }
                                }
                            });
                            }
                        });
                    },1000);
                }else{
                    DataPool.accessrequest.add({
                        data : [["Requestor","SiteArea","Region"],[userID,thisObj.ID,user.Region.split(";#")[0]]], 
                        async : function( results ){
                            if(results.successCount===1){
                                alert("Your request has been sent. Thank you.");
                                // email admins 
                                var e = new EMAIL();
                                e.sendApprovalnotice();
                            }else{
                               alert("There was an error processing your request. Please try again");
                            }
                        }
                    });
                }
            
            }else{
                alert("You have a pending request for this site area.");
            }
            
            }
        
    };
    //Qunit testing only shows up in testing mode 
    M1SP.test({
        name: "SiteAreasObject",
        desc: "Check for record",
        func: function(){
            if (!record) return false;
            else return true;
        }
    });
    
    //set up the object. 
    for(var attr in record){
        thisObj[attr]= record[attr];
    }
};
