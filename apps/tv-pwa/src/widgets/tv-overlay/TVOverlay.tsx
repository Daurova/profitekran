import { Clock } from './ui/Clock/Clock';
import { ChannelLogo } from './ui/ChannelLogo/ChannelLogo';
import classes from './TVOverlay.module.css';

export const TVOverlay = () => {
  return (
    <div className={classes.overlay}>
      <div className={classes.glassPill}>
        <ChannelLogo />
      </div>
      
      <div className={classes.glassPill}>
        <Clock className={classes.clock} />
      </div>
    </div>
  );
};