var finesse = finesse || {};
finesse.gadget = finesse.gadget || {};
finesse.container = finesse.container || {};
clientLogs = finesse.cslogger.ClientLogger || {};  // for logging

/** @namespace */
finesse.modules = finesse.modules || {};
finesse.modules.SampleGadget = (function ($) {
    var numDialogs = 0;      // used to count the calls (dialogs)
    var countOfHandle = 0;
    var dialogState = '';
    var stateTransitions = '';
    var callvars = new Array();  // the callvars array of callvariables     
    var user, states, dialogs, clientLogs,
    
    /**
     * Populates the fields in the gadget with data
     */
    render = function () {
        var currentState = user.getState();
        // html is initially a div tag
        var html = '<div>';
        var uid = '';
        var config = finesse.gadget.Config || {};
        if (config === {}) {
            uid = 'confignull';
        }
        else
            uid = config.id;
        
            html += '<div>Showing Status Call Inbound Workflow</div>';
            html += '<div>login user: ' + uid + '</div>';
            html += '<div>dialog state (participant state): ' + dialogState + '</div>';
            html += '<div>state transitions: ' + stateTransitions + '</div>';
            html += '<div> agent state: ' + currentState;
            + '</div>'
            html += '<div> <table>';
            for (var key in callvars) {
                html += '<tr>'
                html += '<td>key ' + key + '</td> <td> has value ' + callvars[key]; + '</td></tr>'
                //clientLogs.log("key " + key + " has value " + callvars[key]);
            }
            html += '</table></div>';
            console.log("darth 6");
            //set the html document's agentout element to the html we want to render
            $('#agentout').html(html);

            // automatically adjust the height of the gadget to show the html
            gadgets.window.adjustHeight();
            console.log("end render:");
        
    },
    
    _processCall = function (dialog) {

        callvars = dialog.getMediaProperties();
        dialogState = dialog.getState();
        stateTransitions += ' ' + dialogState;
        render();
    },
    
    /**
     *  Handler for additions to the Dialogs collection object.  This will occur when a new
     *  Dialog is created on the Finesse server for this user.
     */
    handleNewDialog = function(dialog) {
        // increment the number of dialogs
        numDialogs++;
        countOfHandle++;

        // get the call variable data from the dialog
        // dialog.getMediaProperties() returns an array of properties
        callvars = dialog.getMediaProperties();
        console.log("handelNewdialog: userLoanID:" + callvars["userLoanID"]);
        var loanid = callvars["userLoandID"];
        //clientLogs.log("handleNewDialog(): callVariable1="+callvars["callVariable1"]);

        dialog.addHandler('change', _processCall);
        render();
    },
     
    /**
     *  Handler for deletions from the Dialogs collection object for this user.  This will occur
     *  when a Dialog is removed from this user's collection (example, end call)
     */
    handleEndDialog = function(dialog) {
        // decrement the number of dialogs
        numDialogs--;
        // render the html in the gadget
        render();
    },
     
    /**
     * Handler for the onLoad of a User object.  This occurs when the User object is initially read
     * from the Finesse server.  Any once only initialization should be done within this function.
     */
    handleUserLoad = function (userevent) {
        // Get an instance of the dialogs collection and register handlers for dialog additions and
        // removals
        dialogs = user.getDialogs({
            onCollectionAdd : handleNewDialog,
            onCollectionDelete : handleEndDialog
        });
        render();
    },
      
    /**
     *  Handler for all User updates
     */
    handleUserChange = function (userevent) {
        mode = "handleUserChange";
        console.log("darth: handleUserChange:" + JSON.stringify(userevent));
        
    };
        
    /** @scope finesse.modules.SampleGadget */
    return {
        /**
         * Performs all initialization for this gadget
         */
        init : function () {
            var cfg = finesse.gadget.Config;

            clientLogs = finesse.cslogger.ClientLogger;   // declare clientLogs

            gadgets.window.adjustHeight();
            
            // Initiate the ClientServices and the logger and then load the user object.  ClientServices are
            // initialized with a reference to the current configuration.
            finesse.clientservices.ClientServices.init(cfg, false);

            // Initiate the ClientLogs. The gadget id will be logged as a part of the message
            clientLogs.init(gadgets.Hub, "ScreenPop", finesse.gadget.Config);

            user = new finesse.restservices.User({
                id: cfg.id, 
                onLoad : handleUserLoad,
                onChange : handleUserChange
            });
                
            states = finesse.restservices.User.States;

            // Initiate the ContainerServices and add a handler for when the tab is visible
            // to adjust the height of this gadget in case the tab was not visible
            // when the html was rendered (adjustHeight only works when tab is visible)
            containerServices = finesse.containerservices.ContainerServices.init();
            containerServices.addHandler(finesse.containerservices.ContainerServices.Topics.ACTIVE_TAB, function() {
                clientLogs.log("Gadget is now visible");  // log to Finesse logger
                // automatically adjust the height of the gadget to show the html
                gadgets.window.adjustHeight();
            });
            containerServices.makeActiveTabReq();
        }
    };
}(jQuery));