class BurndownDay < ActiveRecord::Base
    unloadable
    belongs_to :version

    # total number of points in the backlog
    def self.points_committed(backlog)
      backlog.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of points already resolved (story tasks closed)
    def self.points_resolved(backlog)
      backlog.select do |s|
        if s.descendants.empty?
          # sometimes a story is too small to split it up into tasks
          s.closed?
        else
          s.descendants.select{|t| !t.closed?}.size == 0
        end
      end.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of points already resolved (stories closed)
    def self.points_accepted(backlog)
      backlog.select {|s| s.closed? }.inject(0) {|sum, story| sum + story.story_points.to_f }
    end

    # number of remaining hours
    def self.remaining_hours(backlog)
      backlog.select {|s| not s.closed? && s.descendants.select{|t| !t.closed?}.size != 0}.inject(0) {|sum, story| sum + story.remaining_hours.to_f }
    end
    
    # number of estimated hours
    def self.estimated_hours(backlog)
      backlog.inject(0) {|sum, story| sum + story.estimated_hours.to_f }
    end
end
