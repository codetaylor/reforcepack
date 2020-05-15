/**
 * This function is called by Forge before any minecraft classes are loaded to
 * setup the coremod.
 *
 * @return {object} All the transformers of this coremod.
 * @see https://github.com/Cadiboo/NoCubes/blob/1.14.x/src/main/resources/nocubes-transformer.js
 * @see https://cadiboo.github.io/tutorials/1.14.4/forge/99.99-coremod/
 */
function initializeCoreMod() {
  /*Class/Interface*/ Opcodes = Java.type("org.objectweb.asm.Opcodes");
  /*Class*/ ASMAPI = Java.type("net.minecraftforge.coremod.api.ASMAPI");

  /*Class*/ InsnList = Java.type("org.objectweb.asm.tree.InsnList");

  /*Class*/ AbstractInsnNode = Java.type("org.objectweb.asm.tree.AbstractInsnNode");
  /*Class*/ InsnNode = Java.type("org.objectweb.asm.tree.InsnNode");
  /*Class*/ VarInsnNode = Java.type("org.objectweb.asm.tree.VarInsnNode");
  /*Class*/ MethodInsnNode = Java.type("org.objectweb.asm.tree.MethodInsnNode");

  LABEL = AbstractInsnNode.LABEL;

  return {
    "Minecraft#reloadResources": {
      target: {
        /*
        MC 1.15.1: net/minecraft/client/Minecraft.reloadResources
        Name: g => func_213237_g => reloadResources
        Comment: None
        Side: CLIENT
        AT: public net.minecraft.client.Minecraft func_213237_g()Ljava/util/concurrent/CompletableFuture; # reloadResources
        */
        type: "METHOD",
        class: "net.minecraft.client.Minecraft",
        methodName: "func_213237_g",
        methodDesc: "()Ljava/util/concurrent/CompletableFuture;"
      },
      transformer: function (methodNode) {
        injectMethod(methodNode.instructions);
        return methodNode;
      }
    },
    "Minecraft#init": {
      target: {
        type: "METHOD",
        class: "net.minecraft.client.Minecraft",
        methodName: "<init>",
        methodDesc: "(Lnet/minecraft/client/GameConfiguration;)V"
      },
      transformer: function (methodNode) {
        injectInit(methodNode.instructions);
        return methodNode;
      }
    }
  };
}

// 1) Find INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResources (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; (itf)
// 2) Find the first label before
// 3) Inject after the label

/*

// Java
List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
// ********************************************************** BEGIN **********************************************************
com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$reloadResources(list1);
// **********************************************************  END  **********************************************************
this.setLoadingGui(new ResourceLoadProgressGui(this, this.resourceManager.reloadResources(Util.getServerExecutor(), this, field_223714_G, list), () -> {

// Bytecode
L8
// ********************************************************** BEGIN **********************************************************
ALOAD 2
INVOKESTATIC com/codetaylor/mc/reforcepack/ReforcePackMod.onMinecraft$reloadResources (Ljava/util/List;)V
// **********************************************************  END  **********************************************************
LINENUMBER 725 L8

*/

/*
MC 1.15.1: net/minecraft/resources/IReloadableResourceManager.reloadResources
Name: a => func_219537_a => reloadResources
Comment: None
Side: CLIENT
AT: public net.minecraft.resources.IReloadableResourceManager func_219537_a(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; # reloadResources
*/

function injectMethod(instructions) {

  var reloadResources_name = ASMAPI.mapMethod("func_219537_a"); // IReloadableResourceManager.reloadResources
  var first_INVOKEINTERFACE_reloadResources;
  var arrayLength = instructions.size();
  var log = "\nInspecting " + arrayLength + " instructions";

  for (var i = 0; i < arrayLength; ++i) {
    var instruction = instructions.get(i);
    log += "\nOpcode: " + instruction.opcode;
    if (instruction.opcode == Opcodes.INVOKEINTERFACE) {
      log += "\nINVOKEINTERFACE found, owner:" + instruction.owner + ", name: " + instruction.name + ", desc: " + instruction.desc + ", itf: " + instruction.itf
      if (instruction.owner == "net/minecraft/resources/IReloadableResourceManager") {
        if (instruction.name == reloadResources_name) {
          if (instruction.desc == "(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader;") {
            if (instruction.itf == true) {
              first_INVOKEINTERFACE_reloadResources = instruction;
              break;
            }
          }
        }
      }
    }
  }

  if (!first_INVOKEINTERFACE_reloadResources) {
      throw "Error: Couldn't find injection point \"IReloadableResourceManager.reloadResources\" in method!" + log;
  }

  var firstLabelBefore_first_INVOKEINTERFACE_reloadResources;
  for (i = instructions.indexOf(first_INVOKEINTERFACE_reloadResources); i >= 0; --i) {
      var instruction = instructions.get(i);
      if (instruction.getType() == LABEL) {
          firstLabelBefore_first_INVOKEINTERFACE_reloadResources = instruction;
          print("Found label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\" " + instruction);
          break;
      }
  }

  if (!firstLabelBefore_first_INVOKEINTERFACE_reloadResources) {
      throw "Error: Couldn't find label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\" in method!";
  }

  var toInject = new InsnList();

  toInject.add(new VarInsnNode(Opcodes.ALOAD, 2)); // list1
  toInject.add(new MethodInsnNode(
      //int opcode
      Opcodes.INVOKESTATIC,
      //String owner
      "com/codetaylor/mc/reforcepack/ReforcePackMod",
      //String name
      "onMinecraft$reloadResources",
      //String descriptor
      "(Ljava/util/List;)V",
      //boolean isInterface
      false
  ));

  instructions.insert(firstLabelBefore_first_INVOKEINTERFACE_reloadResources, toInject);
}

// 1) Find INVOKEINTERFACE net/minecraft/resources/IReloadableResourceManager.reloadResources (Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader; (itf)
// 2) Find the first label before
// 3) Inject after the label

/*

  List<IResourcePack> list = this.resourcePackRepository.getEnabledPacks().stream().map(ResourcePackInfo::getResourcePack).collect(Collectors.toList());
  // ********************************************************** BEGIN **********************************************************
  com.codetaylor.mc.reforcepack.ReforcePackMod#onMinecraft$init(list);
  // **********************************************************  END  **********************************************************
  this.setLoadingGui(new ResourceLoadProgressGui(this, this.resourceManager.reloadResources(Util.getServerExecutor(), this, RESOURCE_RELOAD_INIT_TASK, list), (p_229990_2_) -> {

*/

/*

L137
  // ********************************************************** BEGIN **********************************************************
  ALOAD 3
  INVOKESTATIC com/codetaylor/mc/reforcepack/ReforcePackMod.onMinecraft$init (Ljava/util/List;)V
  // **********************************************************  END  **********************************************************
  LINENUMBER 468 L137
*/

function injectInit(instructions) {

  var reloadResources_name = ASMAPI.mapMethod("func_219537_a"); // IReloadableResourceManager.reloadResources
  var first_INVOKEINTERFACE_reloadResources;
	var arrayLength = instructions.size();
  var log = "\nInspecting " + arrayLength + " instructions";

  for (var i = 0; i < arrayLength; ++i) {
    var instruction = instructions.get(i);
    log += "\nOpcode: " + instruction.opcode;
    if (instruction.getOpcode() == Opcodes.INVOKEINTERFACE) {
      log += "\nINVOKEINTERFACE found, owner:" + instruction.owner + ", name: " + instruction.name + ", desc: " + instruction.desc + ", itf: " + instruction.itf
      if (instruction.owner == "net/minecraft/resources/IReloadableResourceManager") {
        if (instruction.name == reloadResources_name) {
          if (instruction.desc == "(Ljava/util/concurrent/Executor;Ljava/util/concurrent/Executor;Ljava/util/concurrent/CompletableFuture;Ljava/util/List;)Lnet/minecraft/resources/IAsyncReloader;") {
            if (instruction.itf == true) {
              first_INVOKEINTERFACE_reloadResources = instruction;
              print('Found injection point "IReloadableResourceManager.reloadResources" in init ' + instruction);
              break;
            }
          }
        }
      }
    }
  }

	if (!first_INVOKEINTERFACE_reloadResources) {
		throw "Error: Couldn't find injection point \"IReloadableResourceManager.reloadResources\" in init! " + log;
	}

	var firstLabelBefore_first_INVOKEINTERFACE_reloadResources;
	for (i = instructions.indexOf(first_INVOKEINTERFACE_reloadResources); i >= 0; --i) {
		var instruction = instructions.get(i);
		if (instruction.getType() == LABEL) {
			firstLabelBefore_first_INVOKEINTERFACE_reloadResources = instruction;
			print("Found label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\" " + instruction);
			break;
		}
	}

	if (!firstLabelBefore_first_INVOKEINTERFACE_reloadResources) {
		throw "Error: Couldn't find label \"firstLabelBefore_first_INVOKEINTERFACE_reloadResources\"!";
	}

	var toInject = new InsnList();

	toInject.add(new VarInsnNode(Opcodes.ALOAD, 9)); // list
	toInject.add(new MethodInsnNode(
		//int opcode
		Opcodes.INVOKESTATIC,
		//String owner
		"com/codetaylor/mc/reforcepack/ReforcePackMod",
		//String name
		"onMinecraft$init",
		//String descriptor
		"(Ljava/util/List;)V",
		//boolean isInterface
		false
	));

	instructions.insert(firstLabelBefore_first_INVOKEINTERFACE_reloadResources, toInject);
}
