import classes from './ChannelLogo.module.css';

export const ChannelLogo = () => {
  return (
    <div className={classes.container}>
      {/* Иконка */}
      {/* <img 
        src="/logo-vdohnovenie.svg" 
        alt="Иконка" 
        className={classes.icon} 
      /> */}
      {/* Текст с премиальным шрифтом */}
      <span className={classes.text}>
        <i>Вдохновение</i>
      </span>
    </div>
  );
};