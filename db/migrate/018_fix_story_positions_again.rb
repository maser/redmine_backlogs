class FixStoryPositionsAgain < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.transaction do
      c = Story.count(:conditions => "parent_id is NULL")
      puts "setting position for #{c} issues"
      Story.find(:all, :conditions => "parent_id is NULL", :order => "project_id ASC, fixed_version_id ASC, position ASC").each_with_index do |s,i|
        puts "#{i} issues…" if i % 100 == 0 && i != 0
        s.position=i+1
        s.save!
      end
    end
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
