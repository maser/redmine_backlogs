class BurndownDay < ActiveRecord::Base
    unloadable
    belongs_to :version

    # total number of points in the backlog
    def self.points_committed(backlog)
      backlog.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of points already resolved (counting tasks)
    def self.points_resolved(backlog)
      backlog.select {|s| s.descendants.select{|t| !t.closed?}.size == 0}.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of points already resolved (only counting stories)
    def self.points_accepted(backlog)
      backlog.select {|s| s.closed? }.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of remaining hours
    def self.remaining_hours(backlog)
      backlog.select {|s| not s.closed? && s.descendants.select{|t| !t.closed?}.size != 0}.inject(0) {|sum, story| sum + story.remaining_hours.to_f }
    end
end
