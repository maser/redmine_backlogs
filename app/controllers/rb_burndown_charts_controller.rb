include RbCommonHelper

class RbBurndownChartsController < RbApplicationController
  unloadable

  def show
    @burndown = @sprint.burndown
    @dash = {
      :data => [ {:label => "committed",
                  :data => @burndown.points_committed.each_with_index.map{ |p, i| [i + 1, p] }},
                 {:label => "remaining",
                  :data => @burndown.points_to_resolve.each_with_index.map{ |p, i| [i + 1, p] }},
                 {:label => "ideal",
                  :data => @burndown.ideal.each_with_index.map{ |p, i| [i + 1, p] }} ],
      :options => { :xaxis => {:ticks => @burndown.days.each_with_index.map{ |d, i| [i + 1, d.strftime("%a")] },
                               :show => true,
                               :min => 1,
                               :max => @burndown.days.size},
                    :yaxis => { :min => 0 },
                    :legend => {:position => "sw"} } }

    respond_to do |format|
      format.html { render :layout => false }
      format.json { render :json => @dash.to_json }
    end
  end

end
