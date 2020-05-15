package com.codetaylor.mc.reforcepack;

import net.minecraft.client.Minecraft;
import net.minecraft.resources.FolderPack;
import net.minecraft.resources.IResourcePack;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.loading.FMLPaths;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Mod(ReforcePackMod.ID)
public class ReforcePackMod {

  public static final String ID = "reforcepack";

  public static final Logger LOGGER = LogManager.getLogger();
  private static Path configPath;

  public ReforcePackMod() {

    configPath = ReforcePackMod.getConfigPath();

    try {
      Files.createDirectories(configPath);

    } catch (IOException e) {
      LOGGER.error("", e);
    }
  }

  private static Path getConfigPath() {

    return FMLPaths.CONFIGDIR.get().resolve(ReforcePackMod.ID);
  }

  /**
   * Called from the ASM injection site to add our resource pack.
   * <pre>
   * List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
   * ********************************************************** BEGIN **********************************************************
   * com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$reloadResources(list1);
   * **********************************************************  END  **********************************************************
   * this.setLoadingGui(new ResourceLoadProgressGui(this, this.resourceManager.reloadResources(Util.getServerExecutor(), this, field_223714_G, list), () -> {
   * ...
   * </pre>
   *
   * @param resourcePacks the list of {@link IResourcePack} packs just about to be loaded
   * @see Minecraft#reloadResources()
   */
  @SuppressWarnings("unused")
  public static void onMinecraft$reloadResources(List<IResourcePack> resourcePacks) {

    LOGGER.info(String.format("Hooking resource pack reload, adding to %d packs", resourcePacks.size()));
    resourcePacks.add(new FolderPack(configPath.toFile()));
  }

  /**
   * Called from the ASM injection site to add our resource pack.
   * <pre>
   * List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
   * // ********************************************************** BEGIN **********************************************************
   * com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$init(list);
   * // **********************************************************  END  **********************************************************
   * this.setLoadingGui(new ResourceLoadProgressGui(this, this.resourceManager.reloadResources(Util.getServerExecutor(), this, RESOURCE_RELOAD_INIT_TASK, list), (p_229990_2_) -> {
   * ...
   * </pre>
   *
   * @param resourcePacks the list of {@link IResourcePack} packs just about to be loaded
   * @see Minecraft#Minecraft(net.minecraft.client.GameConfiguration)
   */
  @SuppressWarnings("unused")
  public static void onMinecraft$init(List<IResourcePack> resourcePacks) {

    LOGGER.info(String.format("Hooking resource pack load, adding to %d packs", resourcePacks.size()));
    resourcePacks.add(new FolderPack(configPath.toFile()));
  }
}
