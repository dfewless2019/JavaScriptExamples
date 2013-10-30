var VIEW_PRINT = function(){/*Module need to be updated in phase to for the getdisplayfields and display name */
    var PassedFormID,
    StatusContainer = "StatusContainer",
    DisplayContainer = "DisplayContainer",
    ThisSubmissions,
    ThisFormObject,
    ThisFormRecord,
    ThisLoopingFields,
    CurrentFormisOTY,
    views=0,
    largestColumnHeight,
    currentColumnHeight,
    addedColumns,
    columnWidth,
    paddingWidth,
    borderWidth,
    totalWidth,
    pageWidth,
    printViewWindow,
    Viewdisplay,
    ViewdisplayColumn,
    ViewdisplayRow,
    ViewDisplayWrapper,
    ViewPrintTable;
     // utilty function 
     var SetConfigFields = function(){// change this function in phase 2 
        setDisplayStatus("Setting Display fields...");
        var formModule = ThisFormRecord.Module;
        if ( formModule === "WINNERS_FORM" ) {// id 6 
            ThisLoopingFields =Winnersfields; // custom change in phase 2  
        } else if ( formModule === "SALES_EXECUTIVE_FORM" ) { // id 5 
            ThisLoopingFields = ThisFormObject.getViewPrintFields(); // oty
        } else if ( formModule === "ACCOUNT_EXCELLENCE_FORM" ) { // id 1  
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "AE_FORM" ) { // id 3 
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "NEW_LOGO_FORM" ) { // id 4 
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "SALES_LEADER_FORM" ) { // id  7
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "SALES_ROOKIE_FORM" ) { // id 8
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "SALES_SUPPORT_FORM" ) {// id 9 
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// oty
		} else if ( formModule === "SOLUTION_PROFESSIONAL_FORM" ) {// id 10 
			ThisLoopingFields = ThisFormObject.getViewPrintFields();// bam 
		} else if ( formModule === "SALES_SKILLS_FORM" ) {// id 2
			ThisLoopingFields = Salesfields; // custom change in phase 2 
        }else {
			Error("Form could not be determined to pull display fields"); 
		}
    };        
     var Error = function(message){
         VIEW_PRINT_OBJECT.stopProgress();
         if(message)setDisplayStatus(message);
         else setDisplayStatus("An unexpected Error has occurred please refresh and try again."); 
     };
     var setDisplayStatus= function(string){
         $("#"+StatusContainer).html("<h3>"+string+"</h3>");
     };
     var setDisplayArea= function(){
         ThisFormObject =  VIEW_PRINT_OBJECT.getFormObject();
         if(ThisFormObject){
            if(ThisFormObject.isOty){
                CurrentFormisOTY=true;
            }else{
                CurrentFormisOTY= false;
            }
            ThisFormRecord = ThisFormObject.getCurrentFormRecord();
            GLOBAL.updateCurrentBreadCrumb("View/Print "+ ThisFormRecord.Title); 
         }else{
             Error("There was an error pulling required form Information, please refresh and try again");
         }
     }; 
     //Print function
     var printView = function(){
        buildPrintHeader();
        buildPrintBody();
        buildPrintFooter();
    }; 
     var buildPrintHeader = function(){
      var displayFields;
      printViewWindow = window.open("","test","status=0,scrollbars=1,resizable=1");
      printViewWindow.document.write("<html><head><link type='text/css' rel='stylesheet' href='/teams/ESGlobalSalesOps/Development/Styles/Print.css' /></head><body>"+ 
            "<div style='margin-left:20px;margin-top:20px;margin-bottom:20px;' id='SelectButton'>Loading...</div>"+
            "<div style='margin-left:20px;margin-top:20px;margin-bottom:20px;font-weight:bold;' id='Directions'>"+
            "Press the Select All button then Copy ( Ctrl+c or right click on selected area and select copy ). Open Excel and paste (Ctrl+v or right click and select paste) "+
            "</div>"+
            "<div id='DisplayContainer'></div></body></html>");
      Viewdisplay = $(printViewWindow.document.body).find("#DisplayContainer");
      
      if(!CurrentFormisOTY){
         displayFields  = VIEW_PRINT_OBJECT.getDiplayFields();
      }else{
         displayFields = ThisFormObject.getViewPrintFields();
      }
      var html ="<table border='1' style='border-style:solid;border-color:Black;'><thead><tr>"; 

      for(var field in displayFields){
          html+="<td  style='vertical-align: top;font-weight: bold; background-color:gray; '>"+(!CurrentFormisOTY ? displayFields[field].name : displayFields[field].getDisplayName()) +"</td>";     
      }
      html +="</tr></thead></table>";
      Viewdisplay.html(html);
      ViewPrintTable = $(printViewWindow.document.body).find("#DisplayContainer table"); 
   };
     var buildPrintFooter = function(){
        var button = $(printViewWindow.document.body).find("#SelectButton");
        button.html("<input type='button' value='Select All'/>"); 
        setTimeout(function(){
                button.click(function(){
                    //printViewWindow.document.body

                    var range;

                    if (printViewWindow.document.selection){
                        //Clear out any current selection
                        printViewWindow.document.selection.empty(); 

                        range = printViewWindow.document.body.createTextRange();
                        range.moveToElementText(printViewWindow.document.getElementById("DisplayContainer"));
                        range.select();
                    }
                    else if (printViewWindow.getSelection) {
                        //Clear out any current selection
                        printViewWindow.getSelection().removeAllRanges(); 

                        range = printViewWindow.document.createRange();
                        range.selectNode(printViewWindow.document.getElementById("DisplayContainer"));
                        printViewWindow.getSelection().addRange(range);
                    }
                });
            }, 100);
     };
     var buildPrintBody = function(){
       // debugger;
        var user = USER_INFO.getRecord(); 
        //setDisplayStatus("Loading submissions...");
        ThisSubmissions = VIEW_PRINT_OBJECT.getSubmissions(); 
        if(ThisSubmissions){
                
                //Viewdisplay.append("<div class='DivWrapper' style='width:" + (totalWidth+20) + "px;'></div>"); 
                //ViewDisplayWrapper = $("#"+DisplayContainer + " .DivWrapper");
                for(var i =0 ; i < ThisSubmissions.length; i++){
                    var CurrentForm,
                        CurrentApproval,
                        CurrentMeta,
                        CurrentEmployee,
                        html="";
                    if(ThisFormObject.usesMetaData()){
                        CurrentMeta = ThisSubmissions[i].metaData;
                        CurrentEmployee = ThisSubmissions[i].metaData.employee;
                        if(!CurrentEmployee.userCanModify())continue;
                        views++;
                    }else{
                       // debugger; 
                        // check logged in user vs the form submitted buy region 
                        if(!user.isAdmin()){
                            var UserToCheck = DataPool.users.array[ThisSubmissions[i].User.split(";#")[0]],found = false;
                            if(!UserToCheck ) continue;
                            var currentUserRegions = user.Region,
                            currentUserToCheck =  UserToCheck.Region;
                            if(!currentUserRegions && !currentUserToCheck) continue;
                            currentUserRegions = currentUserRegions.split(";#");
                            currentUserToCheck = currentUserToCheck.split(";#");
                            for(var x=0 ; x < currentUserRegions.length; x++){
                                for(var t=0 ; t < currentUserToCheck.length; t++){
                                    if(currentUserRegions[x]===currentUserToCheck[t]){
                                        found = true;
                                        //break;
                                        
                                    }
                                    if(found){
                                        break;
                                    }
                                }
                            }
                            if(!found)continue;
                            views++;
                        }else{
                            views++;
                        }
                    }
                    CurrentForm = ThisSubmissions[i]; 
                    CurrentApproval = ThisSubmissions[i].getApproval(); 
                    html+="<tr id='Row" + i + "' class='DivRow'>";
                    for(var field in ThisLoopingFields){
                        if(CurrentFormisOTY){
                            html += "<td style='vertical-align: top' class='DivColumn'>" + ThisLoopingFields[field].getViewPrintValue( CurrentForm ) + "</td>";
                        }else{
                            if( ThisLoopingFields[field].list==="ThisFormObject" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + ThisLoopingFields[field].record(CurrentForm) + "</td>";
                                }else{
                                    // open for other types
                                    //html += "<div class='DivColumn'>" + ThisFormObject[ThisLoopingFields[field].record] + "</div>";
                                }

                            }else if ( ThisLoopingFields[field].list==="CurrentMeta" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + ThisLoopingFields[field].record(CurrentMeta) + "</td>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record].normalDate()) + "</td>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record].split(";#")[1]) + "</td>";
                                    }else{
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record]) + "</td>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentMeta[ThisLoopingFields[field].record] + "</div>";
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentForm" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + ThisLoopingFields[field].record() + "</td>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record].normalDate()) + "</td>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record].split(";#")[1]) + "</td>";
                                    }else{
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record]) + "</td>";
                                    }
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentApproval" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + ThisLoopingFields[field].record() + "</div>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record].normalDate()) + "</td>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record].split(";#")[1]) + "</td>";
                                    }else{
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record]) + "</td>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentApproval[ThisLoopingFields[field].record] + "</div>";
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentEmployee" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + ThisLoopingFields[field].record() + "</td>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record].normalDate()) + "</td>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record].split(";#")[1]) + "</td>";
                                    }else{
                                        html += "<td style='vertical-align: top'  class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record]) + "</td>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentEmployee[ThisLoopingFields[field].record] + "</div>";
                                }
                            }

                            //html+="<div class='DivColumn'>"+html+"</div>"
                        }
                    }
                    //html+="<div style='clear:both'></div>";
                    html+="</tr>"; 
                    ViewPrintTable.append(html); 
                    /*
                    addedColumns = $("#Row" + i).find(".DivColumn");
			
                    largestColumnHeight = 0; 

                    for ( var j = 0; j < addedColumns.length; j++ ) {
                        addedColumns[j] = $(addedColumns[j]);

                        currentColumnHeight = parseInt( addedColumns[j].css("height"), 10 ) +
                                              (parseInt( addedColumns[j].css("padding"), 10 ) * 2); 

                        if ( largestColumnHeight < currentColumnHeight ) {
                            largestColumnHeight = currentColumnHeight;
                        }
                    }

                    $("#Row" + i + " .DivColumn").css("height", largestColumnHeight);
                    */
                }
                if(views<=0){
                    var html2="<tr><td colspan="+ ThisLoopingFields.lenght +">no Employees to show </td></tr>";
                    ViewPrintTable.append(html2);
                }else{
                    //$("#PrintButtonContainer").html("<input class='fromBtn' type='button' value='Print' onclick='VIEW_PRINT.printView()'/>"); 
                }
                
        }else{// this might be no employees 
            Viewdisplay.append("no Employees to show"); 
            Error("Could not pull submissions");
        }
     };
     // view function
     var buildHeader = function( ){
        //debugger;
        var displayFields;
        Viewdisplay = $("#"+DisplayContainer); 
        setDisplayStatus("Loading Form Header...");
        if(!CurrentFormisOTY){
           displayFields  = VIEW_PRINT_OBJECT.getDiplayFields();
        }else{
           displayFields = ThisFormObject.getViewPrintFields();
        }

        var html ="<div class='DivRow'>"; 
        for(var field in displayFields){
            html+="<div class='DivColumn DivColumnColored'>"+(!CurrentFormisOTY ? displayFields[field].name : displayFields[field].getDisplayName()) +"</div>";     
        }
        if(CurrentFormisOTY){
            html+="<div class='DivColumn DivColumnColored'>View Form</div>";
        }     
        html+="<div style='clear:both'></div>"; 
        html +="</div>";
        Viewdisplay.html(html);
        ViewdisplayColumn = $("#"+DisplayContainer+" .DivColumn"); 
        ViewdisplayRow = $("#"+DisplayContainer+" .DivRow");

         // dynamic height and width calaculations
        addedColumns = Viewdisplay.find(".DivColumn");

        largestColumnHeight = 0;

        for ( var i = 0; i < addedColumns.length; i++ ) {
           addedColumns[i] = $(addedColumns[i]);
 
           currentColumnHeight = parseInt( addedColumns[i].css("height"), 10 ) +
                                 (parseInt( addedColumns[i].css("padding"), 10 ) * 2);

           if ( largestColumnHeight < currentColumnHeight ) {
               largestColumnHeight = currentColumnHeight;
           }
        }

		ViewdisplayColumn.css("height", largestColumnHeight);
        		// Figuring out column widths
		columnWidth = Viewdisplay.find(".DivColumn:first").css("width");
		borderWidth = Viewdisplay.find(".DivColumn:first").css("border-width");
		paddingWidth = Viewdisplay.find(".DivColumn:first").css("padding");
		
		columnWidth = parseInt( columnWidth, 10 );
		borderWidth = parseInt( borderWidth, 10 );
		paddingWidth = parseInt( paddingWidth, 10 );
		
		if ( !columnWidth ) {
			columnWidth = 0;
		}
		
		if ( !borderWidth ) {
			borderWidth = 0;
		}
		
		if ( !paddingWidth ) {
			paddingWidth = 0;
		}
		
		totalWidth = (columnWidth * ( CurrentFormisOTY ? (displayFields.length+1) :displayFields.length)) + (borderWidth * ( CurrentFormisOTY ? (displayFields.length+1) :displayFields.length)) + (paddingWidth * 2 * ( CurrentFormisOTY ? (displayFields.length+1) :displayFields.length));
		
		pageWidth = Viewdisplay.css("width");
		
		pageWidth = parseInt( pageWidth, 10 );
		
		if ( totalWidth < pageWidth ) {
			totalWidth = pageWidth;
		}
		
		ViewdisplayRow.css("width", totalWidth);
        
     };
     var buildFooter = function(){
        Viewdisplay.append("</div>");  
        setDisplayStatus("Results Loaded.");
     };
     var buildBody = function(){
       // debugger;
        var user = USER_INFO.getRecord(); 
        setDisplayStatus("Loading submissions...");
        ThisSubmissions = VIEW_PRINT_OBJECT.getSubmissions(); 
        if(ThisSubmissions){
                
                Viewdisplay.append("<div class='DivWrapper' style='width:" + (totalWidth+20) + "px;'></div>"); 
                ViewDisplayWrapper = $("#"+DisplayContainer + " .DivWrapper");
                for(var i =0 ; i < ThisSubmissions.length; i++){
                    var CurrentForm,
                        CurrentApproval,
                        CurrentMeta,
                        CurrentEmployee,
                        html="";
                    if(ThisFormObject.usesMetaData()){
                        CurrentMeta = ThisSubmissions[i].metaData;
                        CurrentEmployee = ThisSubmissions[i].metaData.employee;
                        if(!CurrentEmployee.userCanModify())continue;
                        views++;
                    }else{
                       // debugger; 
                        // check logged in user vs the form submitted buy region 
                        if(!user.isAdmin()){
                            var UserToCheck = DataPool.users.array[ThisSubmissions[i].User.split(";#")[0]],found = false;
                            if(!UserToCheck ) continue;
                            var currentUserRegions = user.Region,
                            currentUserToCheck =  UserToCheck.Region;
                            if(!currentUserRegions && !currentUserToCheck) continue;
                            currentUserRegions = currentUserRegions.split(";#");
                            currentUserToCheck = currentUserToCheck.split(";#");
                            for(var x=0 ; x < currentUserRegions.length; x++){
                                for(var t=0 ; t < currentUserToCheck.length; t++){
                                    if(currentUserRegions[x]===currentUserToCheck[t]){
                                        found = true;
                                        //break;
                                        
                                    }
                                    if(found){
                                        break;
                                    }
                                }
                            }
                            if(!found)continue;
                            views++;
                        }else{
                            views++;
                        }
                    }
                    CurrentForm = ThisSubmissions[i]; 
                    CurrentApproval = ThisSubmissions[i].getApproval(); 
                    html+="<div id='Row" + i + "' class='DivRow'>";
                    for(var field in ThisLoopingFields){
                        if(CurrentFormisOTY){
                            html += "<div class='DivColumn'>" + ThisLoopingFields[field].getViewPrintValue( CurrentForm ) + "</div>";
                        }else{
                            if( ThisLoopingFields[field].list==="ThisFormObject" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<div class='DivColumn'>" + ThisLoopingFields[field].record(CurrentForm) + "</div>";
                                }else{
                                    // open for other types
                                    //html += "<div class='DivColumn'>" + ThisFormObject[ThisLoopingFields[field].record] + "</div>";
                                }

                            }else if ( ThisLoopingFields[field].list==="CurrentMeta" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<div class='DivColumn'>" + ThisLoopingFields[field].record(CurrentMeta) + "</div>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<div class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record].normalDate()) + "</div>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<div class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record].split(";#")[1]) + "</div>";
                                    }else{
                                        html += "<div class='DivColumn'>" + (CurrentMeta[ThisLoopingFields[field].record] === undefined ? "" : CurrentMeta[ThisLoopingFields[field].record]) + "</div>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentMeta[ThisLoopingFields[field].record] + "</div>";
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentForm" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<div class='DivColumn'>" + ThisLoopingFields[field].record() + "</div>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<div class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record].normalDate()) + "</div>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<div class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record].split(";#")[1]) + "</div>";
                                    }else{
                                        html += "<div class='DivColumn'>" + (CurrentForm[ThisLoopingFields[field].record] === undefined ? "" : CurrentForm[ThisLoopingFields[field].record]) + "</div>";
                                    }
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentApproval" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<div class='DivColumn'>" + ThisLoopingFields[field].record() + "</div>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<div class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record].normalDate()) + "</div>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<div class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record].split(";#")[1]) + "</div>";
                                    }else{
                                        html += "<div class='DivColumn'>" + (CurrentApproval[ThisLoopingFields[field].record] === undefined ? "" : CurrentApproval[ThisLoopingFields[field].record]) + "</div>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentApproval[ThisLoopingFields[field].record] + "</div>";
                                }
                            }else if ( ThisLoopingFields[field].list==="CurrentEmployee" ){
                                if(ThisLoopingFields[field].type==="Function"){
                                    html += "<div class='DivColumn'>" + ThisLoopingFields[field].record() + "</div>";
                                }else if (ThisLoopingFields[field].type==="Date"){
                                    html += "<div class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record].normalDate()) + "</div>";
                                }else{
                                    if(ThisLoopingFields[field].options=== "loopUp"){// fields that need to be split on display 
                                        html += "<div class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record].split(";#")[1]) + "</div>";
                                    }else{
                                        html += "<div class='DivColumn'>" + (CurrentEmployee[ThisLoopingFields[field].record] === undefined ? "" : CurrentEmployee[ThisLoopingFields[field].record]) + "</div>";
                                    }
                                    //html += "<div class='DivColumn'>" + CurrentEmployee[ThisLoopingFields[field].record] + "</div>";
                                }
                            }

                            //html+="<div class='DivColumn'>"+html+"</div>"
                        }
                    }
                    if(CurrentFormisOTY){
                        html += "<div class='DivColumn'><a target='_blank' href='/*URL reomved*/?Form=" + PassedFormID + "&Submission=" + CurrentForm.ID + "'>View Form</a></div>";
                    }
                    html+="<div style='clear:both'></div>";
                    html+="</div>";
                    
                    ViewDisplayWrapper.append(html); 
                    
                    addedColumns = $("#Row" + i).find(".DivColumn");
			
                    largestColumnHeight = 0; 

                    for ( var j = 0; j < addedColumns.length; j++ ) {
                        addedColumns[j] = $(addedColumns[j]);

                        currentColumnHeight = parseInt( addedColumns[j].css("height"), 10 ) +
                                              (parseInt( addedColumns[j].css("padding"), 10 ) * 2); 

                        if ( largestColumnHeight < currentColumnHeight ) {
                            largestColumnHeight = currentColumnHeight;
                        }
                    }

                    $("#Row" + i + " .DivColumn").css("height", largestColumnHeight);
                }
                if(views<=0){
                    var html2="<div class='DivRow'>no Employees to show<div style='clear:both'></div></div></div>";
                    ViewDisplayWrapper.append(html2);
                }else{
                    $("#PrintButtonContainer").html("<input class='formBtn Submitbutton' type='button' value='Print' onclick='VIEW_PRINT.printView()'/>"); 
                }
                
        }else{// this might be no employees 
            Viewdisplay.append("no Employees to show"); 
            Error("Could not pull submissions");
        }
     };
     
     /*winners and sales fields for display */
     var Winnersfields =[ 
                {
                    name:"Year",
					type: "Function",
                    record: getFiscalYear = function(CurrentForm){
                        return CurrentForm.getFiscalYear() === undefined ? " ": CurrentForm.getFiscalYear().split(";#")[1]; 
                    }, 
                    list: "ThisFormObject"
                },
                {
                    name: "Employee ID", 
					type: "ID",
                    record:"EmployeeID",
                    list:"CurrentEmployee"
                    
                },
                {
                    name: "Name",
					type: "Function",
                    record: getName = function(CurrentMeta){
                         return CurrentMeta.getName() === undefined ? "":CurrentMeta.getName();
                    },
                    list:"CurrentMeta"
                },
                {
                    name: "Region",
					type: "text",
                    record:"Region",
                    list:"CurrentMeta",
                    options:"loopUp"
            
                },
                {
                    name: "Sub Region",
					type: "text",
                    record:"SubRegion",
                    list:"CurrentMeta" 
                },
                {
                    name: "Type of Plan",
					type: "text",
                    record:"TypeOfPlan",
                    list:"CurrentMeta"
                },
                {
                    name: "Role",
					type: "text",
                    record: "Role",
                    list:"CurrentMeta"
                },
                {
                    name: "Effective Date",
					type: "Date",
                    record:"EffectiveDate",
                    list:"CurrentMeta"
                },
                {
                    name: "Percent Performance TCV",
					type: "text",
                    record:"PercentPerformance",
                    list:"CurrentMeta"
                },
                {
                    name: "Percent Performance TEM",
					type: "text",
                    record:"PercentPerformance0",
                    list:"CurrentMeta"
                },
                {
                    name: "Percent Performance FFYR",
					type: "text",
                    record:"PercentPerformance1",
                    list:"CurrentMeta"
                },
                {
					name: "Approve Honoree",
                    record:"Status",
                    type: "Text",
                    list:"CurrentApproval",
                    options:"loopUp"
				},
				{
					name: "Decline Reason",
                    record:"Comments",
					type: "textarea",
                    list:"CurrentApproval"
              
				},
				{
					name: "FPR",
                    record:"FPR",
					type: "Text",
                    list:"CurrentForm",
                    options:"loopUp"
            
                    
				},
				{
					name: "Accomplishments & Special Achievements", 
                    record:"AccomplishmentsAnd",
					type: "Text",
                    list:"CurrentForm"
				},
				{
					name: "Comments",
                    record:"Comments",
					type: "Text",
                    list:"CurrentForm"
				}
			];
     var Salesfields =[
                {
                    name: "Year",
					type: "Function",
                    record: getFiscalYear = function(CurrentForm){
                        return CurrentForm.getFiscalYear() === undefined ? " ": CurrentForm.getFiscalYear().split(";#")[1];
                    },
                    list: "ThisFormObject"
                },
                {
                    name: "Employee",
					type: "Function",
                    record: getSalesName = function(CurrentMeta){
                        return CurrentMeta.getName() === undefined ? "":CurrentMeta.getName();
                    },
                    list: "CurrentMeta"
                },
				{
					name: "Business-Value Proposition Creation",
                    record: "SellingSkill_x0020",
					type: "Text",
					list: "CurrentForm",
                    options: "loopUp"
				},
				{
					name: "Clear and Effective Communication",
					record: "SellingSkill_x00200",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
				},
				{
					name: "C-Level Partnering",
                    record: "SellingSkill_x00201",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
				{
					name: "Customer and Industry Knowledge",
                    record: "SellingSkill_x00202",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
				{
					name: "Customer Relationship Management",
                    record: "SellingSkill_x00203",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
				{
					name: "Deal Development/Shaping",
                    record: "SellingSkill_x00204",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
				{
					name: "Deal Qualification",
                    record: "SellingSkill_x00205",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
				{
					name: "Negotiation",
                    record: "SellingSkill_x00206",
					type: "Text",
                    list: "CurrentForm",
                    options: "loopUp"
				 
				},
				{
					name: "Team Leadership",
                    record: "SellingSkill_x00207",
					type: "dropdown",
                    list: "CurrentForm",
                    options: "loopUp"
					
				},
                {
					name: "Leader Comments",
                    record: "LeaderComments",
					type: "Textarea",
                    list: "CurrentForm"
				}
			];// end Field
    
    $(function(){
        PassedFormID = M1SP.getURLParameter("Form"); 
        if(PassedFormID!==""){
            VIEW_PRINT_OBJECT.onDataCollected(setDisplayArea);  
            VIEW_PRINT_OBJECT.onDataCollected(SetConfigFields);
            VIEW_PRINT_OBJECT.onDataCollected(buildHeader);
            VIEW_PRINT_OBJECT.onDataCollected(buildBody);
            VIEW_PRINT_OBJECT.onDataCollected(buildFooter); 
            VIEW_PRINT_OBJECT.registerForm(PassedFormID);
        }else{
             setDisplayStatus("No Url Parameters "); 
        }

    });
    return {
        printView:printView
    };
}();