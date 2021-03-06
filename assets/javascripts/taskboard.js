/***************************************
  TASKBOARD
***************************************/

RB.Taskboard = RB.Object.create(RB.Model, {
    
  initialize: function(el){
    var j = $(el);
    var self = this; // So we can bind the event handlers to this object
    
    self.$ = j;
    self.el = el;
    
    // Associate this object with the element for later retrieval
    j.data('this', self);

    // Initialize column widths
    self.colWidthUnit = $(".swimlane").width();
    self.defaultColWidth = 2;
    self.loadColWidthPreference();
    self.updateColWidths();
    $("#col_width input").bind('keyup', function(e){ if(e.which==13) self.updateColWidths() });

    // Initialize task lists
    j.find("#tasks .list").sortable({ 
      connectWith: '#tasks .list', 
      placeholder: 'placeholder',
      start: self.dragStart,
      stop: self.dragStop,
      update: self.dragComplete,
      activate: self.dragInitPossibleStatus,
      deactivate: self.dragResetPossibleStatus
    });

    // Initialize each task in the board
    j.find('.task').each(function(index){
      var task = RB.Factory.initialize(RB.Task, this); // 'this' refers to an element with class="task"
    });

    // Add handler for .add_new click
    j.find('#tasks .add_new').bind('mouseup', self.handleAddNewTaskClick);


    // Initialize impediment lists
    j.find("#impediments .list").sortable({ 
      connectWith: '#impediments .list', 
      placeholder: 'placeholder',
      start: self.dragStart,
      stop: self.dragStop,
      update: self.dragComplete,
      activate: self.dragInitPossibleStatus,
      deactivate: self.dragResetPossibleStatus
    });

    // Initialize each task in the board
    j.find('.impediment').each(function(index){
      var task = RB.Factory.initialize(RB.Impediment, this); // 'this' refers to an element with class="impediment"
    });

    // Add handler for .add_new click
    j.find('#impediments .add_new').bind('mouseup', self.handleAddNewImpedimentClick);
  },
  
  dragComplete: function(event, ui) {
    var isDropTarget = (ui.sender==null); // Handler is triggered for source and target. Thus the need to check.
    
    if(isDropTarget){
      // check whether this is an allowed status transition
      var thisStatus = parseInt(ui.item.parent('td').first().attr('id').split('_')[1]);
      if (ui.item.data('this').canChangeIntoStatus(thisStatus)) {
        // save
        ui.item.data('this').saveDragResult();
      } else {
        // cancel doesn’t work in this callback
        ui.item.data('shouldCancel', true);
      }
    }    
  },

  dragStart: function(event, ui){
    ui.item.addClass("dragging");
  },
  
  dragStop: function(event, ui){
    ui.item.removeClass("dragging");

    // cancel sort if status is not allowed
    if (ui.item.data('shouldCancel')) {
      $(this).sortable('cancel');
    }
    ui.item.data('shouldCancel', null);
  },

  // mark the status as possible or impossible by adding
  // a class to the element
  dragInitPossibleStatus: function(event, ui) {
    var thisStatus = parseInt($(this).attr('id').split('_')[1]);
    if (ui.item.data('this').canChangeIntoStatus(thisStatus)) {
      $(this).addClass('status-possible');
    } else {
      $(this).addClass('status-impossible');
    }
  },

  // remove the status possibility markings
  dragResetPossibleStatus: function(event, ui) {
    $(this).removeClass('status-possible');
    $(this).removeClass('status-impossible');
  },

  handleAddNewImpedimentClick: function(event){
    var row = $(this).parents("tr").first();
    $('#taskboard').data('this').newImpediment(row);
  },
  
  handleAddNewTaskClick: function(event){
    var row = $(this).parents("tr").first();
    $('#taskboard').data('this').newTask(row);
  },

  loadColWidthPreference: function(){
    var w = RB.UserPreferences.get('taskboardColWidth');
    if(w==null){
      w = this.defaultColWidth;
      RB.UserPreferences.set('taskboardColWidth', w);
    }
    $("#col_width input").val(w);
  },

  newImpediment: function(row){
    var impediment = $('#impediment_template').children().first().clone();
    row.find(".list").first().prepend(impediment);
    var o = RB.Factory.initialize(RB.Impediment, impediment);
    o.edit();
  },
        
  newTask: function(row){
    var task = $('#task_template').children().first().clone();
    row.find(".list").first().prepend(task);
    var o = RB.Factory.initialize(RB.Task, task);
    o.edit();
  },
  
  updateColWidths: function(){
    var w = parseInt($("#col_width input").val());
    if(w==null || isNaN(w)){
      w = this.defaultColWidth;
    }
    $("#col_width input").val(w)
    RB.UserPreferences.set('taskboardColWidth', w);
    $(".swimlane").width(this.colWidthUnit * w).css('min-width', this.colWidthUnit * w);
  }
});
