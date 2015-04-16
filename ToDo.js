var HelperFunctions = {
    ConstructorToDoApp: function () {
        this.bReady = false;
        this.oCurrentUser = {};
        this.oToDoList = {};
        this.Init = function () {
            var that = this;
            var Promise = $.get(WebAddress + "/GetDataForCurrentlyLoggedUser", function (data) {
                that.oCurrentUser = data.oCurrentUser;
                for (var i = 0; i < data.oToDoList.length; i++) {
                    that.oToDoList.push(new HelperFunctions.ContructorCreateNote(data.oToDoList[i]));
                }
            });
            return Promise;
            // Ajax GET - call to get currentUser and previously created ToDo list
            /*Returns two Objects
                1. oCurrentUser - with structure as follows:
                            oCurrentUser = {
                                nEmpID: 001,
                                sName: "Santa",
                                bIsAdmin: false,
                                bHasWritePermission: true
                            }
                2. oToDoList - with structure as follows:
                            oToDo = {
                                sListID: "List_001"
                                sListName: "MyList1",
                                dDeadLine: "03/25/2015",
                                arrTasks: [{
                                    sTaskID: "Task_001"
                                    sTaskName: "Task1",
                                    nEstimatedHours: 18
                                }, {
                                    sTaskID: "Task_002"
                                    sTaskName: "Task2",
                                    nEstimatedHours: 12.5
                                }, {
                                    sTaskID: "Task_003"
                                    sTaskName: "Task3",
                                    nEstimatedHours: 6.5
                                }],
                                arrAssignedTo: [{
                                    nEmpID: 123,
                                    nPermissionType: 1, // Read
                                }, {
                                    nEmpID: 456,
                                    nPermissionType: 2, // Write
                                }]
                            }

            */
        }
        this.CreateToDoList = function () {
            // ONLY Admin can create
            if (this.bReady && this.oCurrentUser.bIsAdmin) {
                // If ADMIN, then show UI to Create ToDo list
                // Also Enable button which calls - this.SaveToDo

                // This is only for UI. Admin can enter ToDo list name and Deadline
            }
        }
        this.SaveToDo = function (oToDoList) {
            // AJAX Post
            // Send oToDoList newly created object
            // Service logic would include adding a new List and giving unique List ID and Task ID

            // oToDoList will be undefined if coming from call is from Admin, else will have value
            if (undefined === oToDoList) {
                oToDoList = {
                    sListName: $("#ListName").val(),
                    dDeadLine: $("DeadLine").val() ? $("DeadLine").val() : new Date(),
                    arrTasks: HelperFunctions.CustomLogic_GetListOfTask(),
                    arrAssignedTo: HelperFunctions.CustomLogic_GetListOfAssignedTo()
                }
                var that = this;
                $.ajax({
                    type: "POST",
                    url: WebAddress + "Admin/SaveToDo",
                    data: oToDoList,
                    success: function (data) {
                        that.oToDoList.push(new HelperFunctions.ContructorCreateNote(oToDoList));
                    }
                });
            }
        }
        this.AddTasksUnderList = function (sListID) {
            // Only users with Create Permission can Add
            if (this.bReady && this.oCurrentUser.bHasWritePermission) { // Assuming Admin will have write permission anyway else add "this.oCurrentUser.bIsAdmin"
                for (var i = 0; i < this.oToDoList.length; i++) {
                    if (this.oToDoList[i].sListID === sListID) {
                        this.oToDoList[i].arrTasks.push(HelperFunctions.CustomLogic_GetListOfTask);
                        break;
                    }
                }
                this.SaveToDo({
                    sListName: this.oToDoList[i].sListName,
                    dDeadLine: this.oToDoList[i].dDeadLine,
                    arrTasks: this.oToDoList[i].arrTasks,
                    arrAssignedTo: this.oToDoList[i].arrAssignedTo
                });
            }
        },
        this.AddAssignedToUnderList = function (sListID) {
            // Only users with Create Permission can Add
            if (this.bReady && this.oCurrentUser.bHasWritePermission) { // Assuming Admin will have write permission anyway else add "this.oCurrentUser.bIsAdmin"
                for (var i = 0; i < this.oToDoList.length; i++) {
                    if (this.oToDoList[i].sListID === sListID) {
                        this.oToDoList[i].arrAssignedTo.push(HelperFunctions.CustomLogic_GetListOfAssignedTo);
                        break;
                    }
                }
                this.SaveToDo({
                    sListName: this.oToDoList[i].sListName,
                    dDeadLine: this.oToDoList[i].dDeadLine,
                    arrTasks: this.oToDoList[i].arrTasks,
                    arrAssignedTo: this.oToDoList[i].arrAssignedTo
                });
            }
        }
        this.GetToDoListToEdit = function () {
            if (this.bReady) {
                if (this.oCurrentUser.bIsAdmin) {
                    // Return entire list
                    return this.oToDoList;
                } else {
                    // Get only those items which have been assigned to the user
                    var UserSpecificoToDoList = [];
                    for (var i = 0; i < this.oToDoList.lenght; i++) {
                        for (var j = 0; j < this.oToDoList[i].arrAssignedTo.length; i++) {
                            if (this.oToDoList[i].arrAssignedTo[j].nEmpID === this.oCurrentUser.nEmpID) {
                                UserSpecificoToDoList.push(this.oToDoList[i]);
                            }
                        }
                    }
                    return UserSpecificoToDoList;
                }
            }
        }
        this.GetToDoList = function () {
            // ReadOnly to do list. All can see
            return this.oToDoList;
        }

    },
    ContructorCreateNote: function (oToDo) {
        this.sListID = oToDo.sListID;
        this.sListName = oToDo.sListName;
        this.dDeadLine = oToDo.dDeadLine ? new Date(oToDo.dDeadLine) : null;
        this.arrTasks = [];
        this.arrAssignedTo = [];

        for (var i = 0; i < oToDo.arrTasks.length; i++) {
            this.arrTasks.push(new HelperFunctions.ConstructorCreateTask(oToDo.arrTasks[i]));
        }
        for (var j = 0; j < oToDo.arrAssignedTo.length ; j++) {
            this.arrAssignedTo.push(new HelperFunctions.ConstructorAssign(oToDo.arrAssignedTo[j]));
        }

        this.CreateTask = function () {
            if (oToDoApp.oCurrentUser.bHasWritePermission) {
                var oToDoTask = {
                    sTaskName: $("#TaskName").val(),
                    nEstimatedHours: $("#EstimatedHours").val()
                };
                this.arrTasks.push(new HelperFunctions.ConstructorCreateTask(oToDoTask));
                oToDoApp.AddTasksUnderList(this.sListID);
            }
        }
        this.AssignTo = function () {
            if (oToDoApp.oCurrentUser.bHasWritePermission) {
                var that = this;
                var permType = $("#ReadWrite").val();
                $.get(WebAddress + "/EmployeeID.html?UserName=KishoreKumar", function (data) {
                    var arrAssignedTo = {
                        nEmpID: data,
                        nPermissionType: permType === "Read" ? 1 : 2
                    };
                    that.arrAssignedTo.push(new HelperFunctions.ConstructorAssign(arrAssignedTo));
                    oToDoApp.AddTasksUnderList(that.sListID);
                });
            }
        }
        this.RemoveAssignTo = function () {
            // Loop through this.arrAssignedTo array and remove where nEmpID matches
        }
    },
    ConstructorCreateTask: function (oToDoTask) {
        this.sTaskName = oToDoTask.sTaskName;
        this.nEstimatedHours = oToDoTask.nEstimatedHours;
    },
    ConstructorAssign: function (arrAssignedTo) {
        this.nEmpID = arrAssignedTo.nEmpID;
        this.nPermissionType = $("#ReadWrite").val();
    },
    CustomLogic_GetListOfTask: function () {
        // Write JavaScript of jQuery code here to get array of Tasks
    },
    CustomLogic_GetListOfAssignedTo: function () {
        // Write JavaScript of jQuery code here to get array of Users to whom List has been assigned
    }
}

var oToDoApp = (function () {
    var App = HelperFunctions.ConstructorToDoApp();
    App.Init().done(function () {
        App.bReady = true;
    });

    return App;
})();

// In HTML
// When user clicks on Create Note, following function gets evoked
// ------ oToDoApp.CreateToDoList();                --> Admin has access

// Other available methods that get invoked from Button clicks in UI
// ------ oToDoApp.SaveToDo();                      --> Admin has access
// ------ oToDoApp.AddTasksUnderList(sListID);      --> Admin has access
// ------ oToDoApp.AddAssignedToUnderList(sListID); --> Admin has access
// ------ oToDoApp.GetToDoList();                   --> Read Only - All Can access - In UI don't provide options to edit
// ------ oToDoApp.GetToDoListToEdit();             --> Admin and users with Write permission have access --> In UI provide following methods to edit
// ------ oToDoApp.oToDoList.CreateTask();          --> Admin and users with Write permission have access --> No need to pass sListID, as this will be executed in List context + Will auto Save
// ------ oToDoApp.oToDoList.AssignTo();            --> Admin and users with Write permission have access --> No need to pass sListID, as this will be executed in List context + Will auto Save