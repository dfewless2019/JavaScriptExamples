var FISCIALYEAR = function(){
//returns full object
var getFiscalYears = function(){
    return returnObj;
};
//returns only open sales years 
var getSalesSkillsYears = function(){
    return (returnObj.sales === undefined ? [] : returnObj.sales);
};
// returns only open OTY years 
var getOTYYears = function(){
    return (returnObj.oty === undefined ? [] : returnObj.oty);
};
//returns only open winners years
var getWinnersYears = function(){
    return (returnObj.winners === undefined ? [] : returnObj.winners);
};
//return all salse open and closed 
var getSalesSkillsYearsAll = function(){
    return (returnObj.salesAll === undefined ? [] : returnObj.salesAll);
};
//return all OTY open and closed 
var getOTYYearsAll = function(){
    return (returnObj.otyAll === undefined ? [] : returnObj.otyAll);
};
// return all winners years open and closed
var getWinnersYearsAll = function(){
    return (returnObj.winnersAll === undefined ? [] : returnObj.winnersAll);
};

var returnObj = {};
$(function(){
   var results = DataPool.awardyear.getFromServer({  
       async:false
    });
    for(var i =0 ; i < results.items.length; i++){
        //sales
        if(results.items[i].SiteArea && results.items[i].SiteArea.split(";#")[0]==="3" ){
            if(returnObj.sales===undefined){
                returnObj.sales=[];
            }
            if(returnObj.salesAll===undefined){
                returnObj.salesAll=[];
            }
            if(results.items[i].Status !==undefined && results.items[i].Status.split(";#")[0]==="1"){
                returnObj.sales.push(results.items[i]);
                returnObj.salesAll.push(results.items[i]);
            }else{
                returnObj.salesAll.push(results.items[i]);
            }
        }//OTY
        else if (results.items[i].SiteArea && results.items[i].SiteArea.split(";#")[0]==="28" ){
            if(returnObj.oty===undefined){
                returnObj.oty=[];
            }
            if(returnObj.otyAll===undefined){
                returnObj.otyAll=[];
            }
            if(results.items[i].Status !==undefined && results.items[i].Status.split(";#")[0]==="1"){
                returnObj.oty.push(results.items[i]);
                returnObj.otyAll.push(results.items[i]);
            }else{
                returnObj.otyAll.push(results.items[i]);
            }
        }//Winners
        else if (results.items[i].SiteArea && results.items[i].SiteArea.split(";#")[0]==="8" ){
            if(returnObj.winners===undefined){
                returnObj.winners=[];
            }
            if(returnObj.winnersAll===undefined){
                returnObj.winnersAll=[];
            }
            if(results.items[i].Status !==undefined && results.items[i].Status.split(";#")[0]==="1"){
                returnObj.winners.push(results.items[i]);
                returnObj.winnersAll.push(results.items[i]);
            }else{
                returnObj.winnersAll.push(results.items[i]);
            }
        }
    }
}); 
return {
        getFiscalYears:getFiscalYears,
        getSalesSkillsYears:getSalesSkillsYears,
        getOTYYears:getOTYYears,
        getWinnersYears:getWinnersYears,
        getSalesSkillsYearsAll:getSalesSkillsYearsAll,
        getOTYYearsAll:getOTYYearsAll,
        getWinnersYearsAll:getWinnersYearsAll 
};
}();

